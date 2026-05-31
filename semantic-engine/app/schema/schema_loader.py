from __future__ import annotations

import logging
from collections import defaultdict
from typing import Any

from app.clients.coral_client import execute_sql
from app.schema.schema_models import (
    ColumnMetadata,
    FilterMetadata,
    FunctionArgument,
    ResultColumn,
    SchemaCatalog,
    TableFunctionMetadata,
    TableMetadata,
)

logger = logging.getLogger(__name__)

METADATA_QUERIES = {
    "tables": "SELECT * FROM coral.tables",
    "columns": "SELECT * FROM coral.columns",
    "filters": "SELECT * FROM coral.filters",
    "functions": "SELECT * FROM coral.table_functions",
}


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def load_schema(coral_binary: str = "coral") -> SchemaCatalog:
    catalog = SchemaCatalog()

    raw_tables: list[dict[str, Any]] = []
    raw_columns: list[dict[str, Any]] = []
    raw_filters: list[dict[str, Any]] = []
    raw_functions: list[dict[str, Any]] = []

    for key, query in METADATA_QUERIES.items():
        try:
            results = execute_sql(query, coral_binary=coral_binary)
            match key:
                case "tables":
                    raw_tables = results
                case "columns":
                    raw_columns = results
                case "filters":
                    raw_filters = results
                case "functions":
                    raw_functions = results
        except Exception:
            logger.warning("Failed to load coral.%s", key, exc_info=True)

    columns_by_table: dict[str, list[ColumnMetadata]] = defaultdict(list)
    for raw in raw_columns:
        try:
            col = ColumnMetadata(
                schema_name=raw.get("schema_name", ""),
                table_name=raw.get("table_name", ""),
                ordinal_position=_safe_int(raw.get("ordinal_position"), 0),
                column_name=raw.get("column_name", ""),
                data_type=raw.get("data_type", "Utf8"),
                is_nullable=raw.get("is_nullable", True),
                is_virtual=raw.get("is_virtual", False),
                is_required_filter=raw.get("is_required_filter", False),
                description=raw.get("description", ""),
                filter_mode=raw.get("filter_mode"),
            )
            key = f"{col.schema_name}.{col.table_name}"
            columns_by_table[key].append(col)
        except Exception:
            logger.warning("Skipping malformed column row: %s", raw, exc_info=True)

    for raw in raw_tables:
        try:
            schema = raw.get("schema_name", "")
            table = raw.get("table_name", "")
            key = f"{schema}.{table}"
            tbl = TableMetadata(
                schema_name=schema,
                table_name=table,
                description=raw.get("description", ""),
                guide=raw.get("guide", ""),
                required_filters=raw.get("required_filters", ""),
                search_limits_json=raw.get("search_limits_json"),
                columns=columns_by_table.get(key, []),
            )
            catalog.add_table(tbl)
        except Exception:
            logger.warning("Skipping malformed table row: %s", raw, exc_info=True)

    for raw in raw_filters:
        try:
            filt = FilterMetadata(
                schema_name=raw.get("schema_name", ""),
                table_name=raw.get("table_name", ""),
                filter_name=raw.get("filter_name", ""),
                filter_mode=raw.get("filter_mode", "equality"),
                is_required=raw.get("is_required", False),
                data_type=raw.get("data_type", "Utf8"),
                description=raw.get("description", ""),
            )
            catalog.add_filter(filt)
        except Exception:
            logger.warning("Skipping malformed filter row: %s", raw, exc_info=True)

    for raw in raw_functions:
        try:
            args_raw = raw.get("arguments_json", "[]")
            if isinstance(args_raw, str):
                import json as _json

                try:
                    args_data = _json.loads(args_raw) if args_raw else []
                except _json.JSONDecodeError:
                    args_data = []
            elif isinstance(args_raw, list):
                args_data = args_raw
            else:
                args_data = []

            cols_raw = raw.get("result_columns_json", "[]")
            if isinstance(cols_raw, str):
                try:
                    cols_data = _json.loads(cols_raw) if cols_raw else []
                except _json.JSONDecodeError:
                    cols_data = []
            elif isinstance(cols_raw, list):
                cols_data = cols_raw
            else:
                cols_data = []

            func = TableFunctionMetadata(
                schema_name=raw.get("schema_name", ""),
                function_name=raw.get("function_name", ""),
                description=raw.get("description", ""),
                arguments=[FunctionArgument(**a) for a in args_data],
                result_columns=[ResultColumn(**c) for c in cols_data],
                kind=raw.get("kind", "table"),
                search_limits_json=raw.get("search_limits_json"),
            )
            catalog.add_function(func)
        except Exception:
            logger.warning(
                "Skipping malformed function row: %s", raw, exc_info=True
            )

    logger.info(
        "Schema loaded: %d tables, %d columns, %d filters, %d functions",
        len(catalog.tables),
        sum(len(t.columns) for t in catalog.tables.values()),
        len(catalog.filters),
        len(catalog.functions),
    )
    return catalog
