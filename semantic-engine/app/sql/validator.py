from __future__ import annotations

import re

from app.schema.schema_cache import SchemaCache
from app.sql.models import SQLValidationResult

_FORBIDDEN_KEYWORDS: frozenset[str] = frozenset({
    "insert", "update", "delete", "drop", "alter",
    "create", "truncate", "replace", "merge", "call",
    "exec", "execute", "grant", "revoke",
})


def _normalize_sql(sql: str) -> str:
    return re.sub(r"--[^\n]*", "", sql)


def _extract_table_references(sql: str) -> list[str]:
    refs: list[str] = []
    for m in re.finditer(r"\bfrom\s+(\w+(?:\.\w+)?)", sql, re.IGNORECASE):
        refs.append(m.group(1))
    return refs


def validate(
    sql: str,
    schema_cache: SchemaCache,
    required_filters: list[str] | None = None,
) -> SQLValidationResult:
    errors: list[str] = []
    normalized = _normalize_sql(sql).strip()
    if not normalized:
        return SQLValidationResult(valid=False, errors=["Empty SQL statement"])

    first_token_match = re.match(r"\s*(\w+)", normalized, re.IGNORECASE)
    if not first_token_match:
        return SQLValidationResult(valid=False, errors=["Could not parse SQL statement"])

    first_token = first_token_match.group(1).lower()
    if first_token not in ("select", "with"):
        errors.append(
            f"Only SELECT statements are allowed, got '{first_token.upper()}'"
        )

    if ";" in normalized.rstrip(";"):
        parts = [p.strip() for p in normalized.split(";") if p.strip()]
        if len(parts) > 1:
            errors.append(
                f"Multiple statements detected ({len(parts)}). "
                "Only single statements are allowed."
            )

    if errors:
        return SQLValidationResult(valid=False, errors=errors)

    table_refs = _extract_table_references(normalized)
    if table_refs:
        for ref in table_refs:
            if "." not in ref:
                continue
            schema, table = ref.split(".", 1)
            if not schema_cache.get_table(schema, table):
                is_func = table in {
                    f.split(".", 1)[1]
                    for f in schema_cache.functions
                    if "." in f and f.split(".", 1)[0] == schema
                }
                if not is_func:
                    errors.append(
                        f"Table '{ref}' does not exist in the schema catalog. "
                        f"Available schemas: github, notion."
                    )

    if errors:
        return SQLValidationResult(valid=False, errors=errors)

    return SQLValidationResult(valid=True)
