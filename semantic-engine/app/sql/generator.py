from __future__ import annotations

import re

from app.planner.models import QueryPlan
from app.schema.schema_cache import SchemaCache

from app.sql.models import GeneratedSQL

_STOP_WORDS: frozenset[str] = frozenset({
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
    "search", "please", "just", "only",
})

_SEARCH_VERBS: frozenset[str] = frozenset({"search", "find", "lookup"})


def _tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[a-zA-Z_][a-zA-Z0-9_]*", text.lower())
    return [t for t in tokens if len(t) > 1 and t not in _STOP_WORDS]


def _has_search_intent(question: str) -> bool:
    raw = question.lower()
    raw_tokens = re.findall(r"[a-zA-Z_][a-zA-Z0-9_]*", raw)
    return bool(_SEARCH_VERBS & set(raw_tokens))


def _extract_query_arg(
    question: str,
    candidate_tables: list[str],
    candidate_functions: list[str],
) -> str:
    tokens = _tokenize(question)
    known_names: set[str] = set()
    for name in candidate_tables:
        parts = name.lower().split(".")
        known_names.update(parts)
    for name in candidate_functions:
        parts = name.lower().split(".")
        known_names.update(parts)

    filtered = [t for t in tokens if t not in known_names and t not in _SEARCH_VERBS]
    return " ".join(filtered) if filtered else "query"


def _build_table_sql(qualified_name: str) -> str:
    return f"SELECT *\nFROM {qualified_name}\nLIMIT 20"


def _build_function_sql(qualified_name: str, query_arg: str) -> str:
    safe_arg = query_arg.replace("'", "''")
    return f"SELECT *\nFROM {qualified_name}(\n    q => '{safe_arg}'\n)\nLIMIT 20"


def _get_missing_required_filters(
    qualified_name: str,
    plan_filters: list[str],
    schema_cache: SchemaCache,
) -> list[str]:
    if "." not in qualified_name:
        return []
    schema, table = qualified_name.split(".", 1)
    required = schema_cache.get_required_filters(schema, table)
    required_names = {f.filter_name for f in required}
    if not required_names:
        return []
    return sorted(required_names)


def generate(
    plan: QueryPlan,
    schema_cache: SchemaCache,
) -> GeneratedSQL:
    search_intent = _has_search_intent(plan.user_question)
    warnings: list[str] = []

    if search_intent and plan.candidate_functions:
        func_name = plan.candidate_functions[0]
        query_arg = _extract_query_arg(
            plan.user_question,
            plan.candidate_tables,
            plan.candidate_functions,
        )
        sql = _build_function_sql(func_name, query_arg)
        tables_used = [func_name]
    elif plan.candidate_tables:
        table_name = plan.candidate_tables[0]
        sql = _build_table_sql(table_name)
        tables_used = [table_name]

        missing = _get_missing_required_filters(
            table_name, plan.required_filters, schema_cache,
        )
        if missing:
            warnings.append(
                f"Missing required filters: {', '.join(missing)}. "
                "Add WHERE clauses with these filter values."
            )
    else:
        sql = "SELECT 1"
        tables_used = []
        warnings.append("No matching tables or functions found for this question.")

    return GeneratedSQL(
        sql=sql,
        tables_used=tables_used,
        required_filters=plan.required_filters,
        warnings=warnings,
    )
