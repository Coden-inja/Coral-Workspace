from __future__ import annotations

import re

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
    column_match_cache: dict[str, set[str]],
) -> float:
    score = 0.0
    name_lower = table.table_name.lower()
    desc_lower = table.description.lower()
    guide_lower = table.guide.lower()
    matched_tokens: set[str] = set()

    for token in tokens:
        if token == name_lower:
            score += 20.0
            matched_tokens.add(token)
        elif token in name_lower:
            score += 10.0
            matched_tokens.add(token)
        if token in desc_lower:
            score += 4.0
            matched_tokens.add(token)
        if token in guide_lower:
            score += 2.0
            matched_tokens.add(token)

        cache_key = f"{table.schema_name}.{table.table_name}"
        if cache_key not in column_match_cache:
            column_match_cache[cache_key] = set()
            for col in table.columns:
                col_name_lower = col.column_name.lower()
                col_desc_lower = col.description.lower()
                for col_token in (token,):
                    if col_token == col_name_lower:
                        column_match_cache[cache_key].add(col_token)
                    elif col_token in col_name_lower:
                        column_match_cache[cache_key].add(col_token)
                    if col_token and col_token in col_desc_lower:
                        column_match_cache[cache_key].add(col_token)

        if token in column_match_cache[cache_key]:
            score += 3.0
            matched_tokens.add(token)

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
            score += 8.0

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

    column_match_cache: dict[str, set[str]] = {}

    table_scores: list[tuple[float, str, TableMetadata]] = []
    for table in schema_cache.tables.values():
        score = _score_table(table, tokens, column_match_cache)
        if score > 0:
            table_scores.append((-score, table.qualified_name, table))

    table_scores.sort()
    top_tables = [t for _, _, t in table_scores[:max_tables]]

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
        ranked = _ranked_columns(table, tokens, max_columns=max_columns)
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
