from __future__ import annotations

import re
from typing import Any

from app.planner.models import RetrievedContext
from app.schema.schema_cache import SchemaCache
from app.schema.schema_models import (
    ColumnMetadata,
    FilterMetadata,
    TableFunctionMetadata,
    TableMetadata,
)

STOP_WORDS: set[str] = {
    "show", "list", "get", "find", "all", "the", "a", "an",
    "for", "in", "of", "to", "on", "at", "by", "with", "from",
    "me", "my", "i", "we", "us", "is", "are", "was", "were",
    "has", "have", "had", "do", "does", "did", "can", "could",
    "will", "would", "shall", "should", "may", "might", "must",
    "about", "how", "what", "which", "where", "when", "why",
    "please", "need", "want", "like", "tell", "give", "make",
    "that", "this", "these", "those", "than", "then", "also",
    "any", "some", "each", "every", "both", "not", "no", "nor",
    "per", "via", "using", "through", "without", "within",
}

_STOP_WORDS_LOWER = frozenset(STOP_WORDS)


def _tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[a-zA-Z_][a-zA-Z0-9_]*", text.lower())
    return [t for t in tokens if len(t) > 1 and t not in _STOP_WORDS_LOWER]


def _score_table(
    table: TableMetadata,
    tokens: list[str],
    column_match_cache: dict[str, Any] | None = None,
) -> float:
    score = 0.0
    name_lower = table.table_name.lower()
    desc_lower = table.description.lower()
    guide_lower = table.guide.lower()

    # Table name matches
    for token in tokens:
        if token == name_lower:
            score += 20.0
        elif token in name_lower:
            score += 10.0
        
        # Table description/guide matches
        if token in desc_lower:
            score += 4.0
        if token in guide_lower:
            score += 2.0

    # Column matches - prioritizing required filters
    for col in table.columns:
        col_name_lower = col.column_name.lower()
        col_desc_lower = col.description.lower()
        
        for token in tokens:
            if token == col_name_lower:
                if col.is_required_filter:
                    score += 50.0  # Massive boost for exact required filter match
                else:
                    score += 5.0   # Good boost for exact column match
            elif token in col_name_lower:
                score += 3.0       # Minor boost for partial column match
            
            if token in col_desc_lower:
                score += 1.0       # Minor boost for column description match

    # Update cache if provided (for test compatibility)
    if column_match_cache is not None:
        cache_key = f"{table.schema_name}.{table.table_name}"
        column_match_cache[cache_key] = set()

    return score


def _score_function(func: TableFunctionMetadata, tokens: list[str]) -> float:
    score = 0.0
    name_lower = func.function_name.lower()
    desc_lower = func.description.lower()

    for token in tokens:
        if token == name_lower:
            score += 20.0
        elif token in name_lower:
            score += 10.0
        if token in desc_lower:
            score += 4.0

    # Score function arguments
    for arg in func.arguments:
        arg_name_lower = arg.name.lower()
        for token in tokens:
            if token == arg_name_lower:
                if arg.required:
                    score += 50.0  # Massive boost for exact required argument match
                else:
                    score += 5.0
            elif token in arg_name_lower:
                score += 3.0       # Boost for partial argument match

    return score


def _ranked_columns(
    table: TableMetadata,
    tokens: list[str],
    max_columns: int = 20,
) -> list[ColumnMetadata]:
    if not table.columns:
        return []

    scored: list[tuple[float, int, ColumnMetadata]] = []
    for col in table.columns:
        score = 0.0
        col_name_lower = col.column_name.lower()
        col_desc_lower = col.description.lower()

        for token in tokens:
            if token == col_name_lower:
                score += 10.0
            elif token in col_name_lower:
                score += 5.0
            if token in col_desc_lower:
                score += 3.0

        if col.is_required_filter:
            score += 9.0

        scored.append((-score, col.ordinal_position, col))

    scored.sort()
    return [col for _, _, col in scored[:max_columns]]


def retrieve(
    question: str,
    schema_cache: SchemaCache,
    max_tables: int = 10,
    max_columns: int = 20,
) -> RetrievedContext:
    tokens = _tokenize(question)
    if not tokens:
        return RetrievedContext()

    # 1. PATH PATTERN DETECTION
    path_pattern = re.compile(r'[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+')
    has_path_pattern = bool(path_pattern.search(question))

    column_match_cache: dict[str, Any] = {}

    table_scores: list[tuple[float, str, TableMetadata]] = []
    for table in schema_cache.tables.values():
        score = _score_table(table, tokens, column_match_cache)
        
        # 2. SCHEMA CONTEXT ENHANCEMENT (Selection Heuristics)
        if has_path_pattern and table.schema_name == "github" and table.table_name == "issues":
            score += 500.0

        if score > 0:
            table_scores.append((-score, table.qualified_name, table))

    table_scores.sort()
    
    top_tables: list[TableMetadata] = []
    for _, _, table in table_scores[:max_tables]:
        top_tables.append(table.model_copy(deep=True))

    function_scores: list[tuple[float, str, TableFunctionMetadata]] = []
    for func in schema_cache.functions.values():
        score = _score_function(func, tokens)
        if score > 0:
            function_scores.append((-score, func.qualified_name, func))

    function_scores.sort()
    top_functions = [f for _, _, f in function_scores[:max_tables]]

    all_columns: list[ColumnMetadata] = []
    all_filters: list[FilterMetadata] = []
    seen_filter_keys: set[str] = set()

    for table in top_tables:
        # 2. SCHEMA CONTEXT ENHANCEMENT (Metadata Payload)
        effective_max_columns = max_columns
        if has_path_pattern and table.schema_name == "github" and table.table_name == "issues":
            effective_max_columns = 100
            
        ranked = _ranked_columns(table, tokens, effective_max_columns)
        table.columns = ranked
        all_columns.extend(ranked)

        for filt in schema_cache.get_filters(table.schema_name, table.table_name):
            key = f"{filt.filter_name}@{filt.schema_name}.{filt.table_name}"
            if key not in seen_filter_keys:
                seen_filter_keys.add(key)
                all_filters.append(filt)

    return RetrievedContext(
        tables=top_tables,
        columns=all_columns,
        filters=all_filters,
        functions=top_functions,
    )
