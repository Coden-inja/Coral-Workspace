from __future__ import annotations

import json
from contextlib import contextmanager
from typing import Any
from unittest.mock import patch

import pytest

from app.schema.schema_cache import SchemaCache
from app.schema.schema_models import (
    ColumnMetadata,
    FilterMetadata,
    FunctionArgument,
    ResultColumn,
    SchemaCatalog,
    TableFunctionMetadata,
    TableMetadata,
)

SAMPLE_TABLE = {
    "schema_name": "github",
    "table_name": "issues",
    "description": "List issues in a repository",
    "guide": "Requires owner and repo filters.",
    "required_filters": "owner,repo",
    "search_limits_json": None,
}

SAMPLE_TABLE_NO_FILTERS = {
    "schema_name": "notion",
    "table_name": "pages",
    "description": "List pages in Notion",
    "guide": "",
    "required_filters": "",
    "search_limits_json": None,
}

SAMPLE_COLUMNS = [
    {
        "schema_name": "github",
        "table_name": "issues",
        "ordinal_position": 0,
        "column_name": "id",
        "data_type": "Int64",
        "is_nullable": False,
        "is_virtual": False,
        "is_required_filter": False,
        "description": "Issue ID",
        "filter_mode": None,
    },
    {
        "schema_name": "github",
        "table_name": "issues",
        "ordinal_position": 1,
        "column_name": "title",
        "data_type": "Utf8",
        "is_nullable": True,
        "is_virtual": False,
        "is_required_filter": False,
        "description": "Issue title",
        "filter_mode": None,
    },
    {
        "schema_name": "github",
        "table_name": "issues",
        "ordinal_position": 2,
        "column_name": "state",
        "data_type": "Utf8",
        "is_nullable": True,
        "is_virtual": False,
        "is_required_filter": True,
        "description": "Issue state",
        "filter_mode": "equality",
    },
    {
        "schema_name": "notion",
        "table_name": "pages",
        "ordinal_position": 0,
        "column_name": "id",
        "data_type": "Utf8",
        "is_nullable": False,
        "is_virtual": False,
        "is_required_filter": False,
        "description": "Page ID",
        "filter_mode": None,
    },
]

SAMPLE_FILTERS = [
    {
        "schema_name": "github",
        "table_name": "issues",
        "filter_name": "owner",
        "filter_mode": "equality",
        "is_required": True,
        "data_type": "Utf8",
        "description": "Repository owner",
    },
    {
        "schema_name": "github",
        "table_name": "issues",
        "filter_name": "repo",
        "filter_mode": "equality",
        "is_required": True,
        "data_type": "Utf8",
        "description": "Repository name",
    },
]

SAMPLE_FUNCTIONS = [
    {
        "schema_name": "github",
        "function_name": "search_issues",
        "description": "Search GitHub issues and pull requests.",
        "arguments_json": json.dumps(
            [
                {"name": "q", "required": True, "values": []},
                {
                    "name": "mode",
                    "required": False,
                    "values": ["lexical", "semantic", "hybrid"],
                },
            ]
        ),
        "result_columns_json": json.dumps(
            [
                {"name": "title", "type": "Utf8", "nullable": True, "description": ""},
                {"name": "state", "type": "Utf8", "nullable": True, "description": ""},
            ]
        ),
        "kind": "table",
        "search_limits_json": None,
    }
]


ADDITIONAL_TABLES: list[dict[str, Any]] = [
    {
        "schema_name": "github",
        "table_name": "pulls",
        "description": "List pull requests in a repository",
        "guide": "Requires owner and repo.",
        "required_filters": "owner,repo",
        "search_limits_json": None,
    },
    {
        "schema_name": "github",
        "table_name": "commits",
        "description": "List commits in a repository",
        "guide": "Requires owner, repo, and ref.",
        "required_filters": "owner,repo,ref",
        "search_limits_json": None,
    },
    {
        "schema_name": "github",
        "table_name": "authentication",
        "description": "Authentication information for the authenticated user",
        "guide": "",
        "required_filters": "",
        "search_limits_json": None,
    },
    {
        "schema_name": "github",
        "table_name": "workflows",
        "description": "List GitHub Actions workflows",
        "guide": "Requires owner and repo.",
        "required_filters": "owner,repo",
        "search_limits_json": None,
    },
    {
        "schema_name": "notion",
        "table_name": "databases",
        "description": "List Notion databases",
        "guide": "",
        "required_filters": "",
        "search_limits_json": None,
    },
]

ADDITIONAL_COLUMNS: list[dict[str, Any]] = [
    {
        "schema_name": "github",
        "table_name": "pulls",
        "ordinal_position": 0,
        "column_name": "id",
        "data_type": "Int64",
        "is_nullable": False,
        "is_virtual": False,
        "is_required_filter": False,
        "description": "PR ID",
        "filter_mode": None,
    },
    {
        "schema_name": "github",
        "table_name": "pulls",
        "ordinal_position": 1,
        "column_name": "title",
        "data_type": "Utf8",
        "is_nullable": True,
        "is_virtual": False,
        "is_required_filter": False,
        "description": "PR title",
        "filter_mode": None,
    },
    {
        "schema_name": "github",
        "table_name": "commits",
        "ordinal_position": 0,
        "column_name": "sha",
        "data_type": "Utf8",
        "is_nullable": False,
        "is_virtual": False,
        "is_required_filter": False,
        "description": "Commit SHA",
        "filter_mode": None,
    },
    {
        "schema_name": "github",
        "table_name": "authentication",
        "ordinal_position": 0,
        "column_name": "login",
        "data_type": "Utf8",
        "is_nullable": False,
        "is_virtual": False,
        "is_required_filter": False,
        "description": "User login",
        "filter_mode": None,
    },
    {
        "schema_name": "notion",
        "table_name": "databases",
        "ordinal_position": 0,
        "column_name": "id",
        "data_type": "Utf8",
        "is_nullable": False,
        "is_virtual": False,
        "is_required_filter": False,
        "description": "Database ID",
        "filter_mode": None,
    },
]

ADDITIONAL_FILTERS: list[dict[str, Any]] = [
    {
        "schema_name": "github",
        "table_name": "pulls",
        "filter_name": "owner",
        "filter_mode": "equality",
        "is_required": True,
        "data_type": "Utf8",
        "description": "",
    },
    {
        "schema_name": "github",
        "table_name": "pulls",
        "filter_name": "repo",
        "filter_mode": "equality",
        "is_required": True,
        "data_type": "Utf8",
        "description": "",
    },
    {
        "schema_name": "github",
        "table_name": "commits",
        "filter_name": "owner",
        "filter_mode": "equality",
        "is_required": True,
        "data_type": "Utf8",
        "description": "",
    },
    {
        "schema_name": "github",
        "table_name": "commits",
        "filter_name": "repo",
        "filter_mode": "equality",
        "is_required": True,
        "data_type": "Utf8",
        "description": "",
    },
    {
        "schema_name": "github",
        "table_name": "commits",
        "filter_name": "ref",
        "filter_mode": "equality",
        "is_required": True,
        "data_type": "Utf8",
        "description": "",
    },
    {
        "schema_name": "github",
        "table_name": "workflows",
        "filter_name": "owner",
        "filter_mode": "equality",
        "is_required": True,
        "data_type": "Utf8",
        "description": "",
    },
    {
        "schema_name": "github",
        "table_name": "workflows",
        "filter_name": "repo",
        "filter_mode": "equality",
        "is_required": True,
        "data_type": "Utf8",
        "description": "",
    },
]


@pytest.fixture
def mock_coral_tables() -> list[dict[str, Any]]:
    return [SAMPLE_TABLE, SAMPLE_TABLE_NO_FILTERS]


@pytest.fixture
def mock_coral_columns() -> list[dict[str, Any]]:
    return SAMPLE_COLUMNS


@pytest.fixture
def mock_coral_filters() -> list[dict[str, Any]]:
    return SAMPLE_FILTERS


@pytest.fixture
def mock_coral_functions() -> list[dict[str, Any]]:
    return SAMPLE_FUNCTIONS


def build_schema_cache_from_fixtures(
    tables: list[dict[str, Any]] | None = None,
    columns: list[dict[str, Any]] | None = None,
    filters: list[dict[str, Any]] | None = None,
    functions: list[dict[str, Any]] | None = None,
) -> SchemaCache:
    catalog = SchemaCatalog()

    all_tables = tables or []
    all_columns = columns or []
    all_filters = filters or []
    all_functions = functions or []

    cols_by_table: dict[str, list[ColumnMetadata]] = {}
    for raw in all_columns:
        col = ColumnMetadata(
            schema_name=raw["schema_name"],
            table_name=raw["table_name"],
            ordinal_position=raw.get("ordinal_position", 0),
            column_name=raw["column_name"],
            data_type=raw.get("data_type", "Utf8"),
            is_nullable=raw.get("is_nullable", True),
            is_virtual=raw.get("is_virtual", False),
            is_required_filter=raw.get("is_required_filter", False),
            description=raw.get("description", ""),
            filter_mode=raw.get("filter_mode"),
        )
        key = f"{col.schema_name}.{col.table_name}"
        cols_by_table.setdefault(key, []).append(col)

    for raw in all_tables:
        key = f"{raw['schema_name']}.{raw['table_name']}"
        tbl = TableMetadata(
            schema_name=raw["schema_name"],
            table_name=raw["table_name"],
            description=raw.get("description", ""),
            guide=raw.get("guide", ""),
            required_filters=raw.get("required_filters", ""),
            search_limits_json=raw.get("search_limits_json"),
            columns=cols_by_table.get(key, []),
        )
        catalog.add_table(tbl)

    for raw in all_filters:
        filt = FilterMetadata(
            schema_name=raw["schema_name"],
            table_name=raw["table_name"],
            filter_name=raw["filter_name"],
            filter_mode=raw.get("filter_mode", "equality"),
            is_required=raw.get("is_required", False),
            data_type=raw.get("data_type", "Utf8"),
            description=raw.get("description", ""),
        )
        catalog.add_filter(filt)

    for raw in all_functions:
        args_raw = raw.get("arguments_json", "[]")
        if isinstance(args_raw, str):
            try:
                args_data = json.loads(args_raw) if args_raw else []
            except json.JSONDecodeError:
                args_data = []
        else:
            args_data = args_raw or []

        cols_raw = raw.get("result_columns_json", "[]")
        if isinstance(cols_raw, str):
            try:
                cols_data = json.loads(cols_raw) if cols_raw else []
            except json.JSONDecodeError:
                cols_data = []
        else:
            cols_data = cols_raw or []

        func = TableFunctionMetadata(
            schema_name=raw["schema_name"],
            function_name=raw["function_name"],
            description=raw.get("description", ""),
            arguments=[FunctionArgument(**a) for a in args_data],
            result_columns=[ResultColumn(**c) for c in cols_data],
            kind=raw.get("kind", "table"),
            search_limits_json=raw.get("search_limits_json"),
        )
        catalog.add_function(func)

    cache = SchemaCache.get_instance()
    SchemaCache.reset_instance()
    cache = SchemaCache.get_instance()
    cache.configure(coral_binary="coral")
    with _patch_load_schema(catalog):
        cache.load()
    return cache


@contextmanager
def _patch_load_schema(catalog: SchemaCatalog) -> Any:
    with patch("app.schema.schema_cache.load_schema", return_value=catalog):
        yield


@pytest.fixture
def schema_cache() -> SchemaCache:
    tables = [SAMPLE_TABLE, SAMPLE_TABLE_NO_FILTERS] + ADDITIONAL_TABLES
    columns = SAMPLE_COLUMNS + ADDITIONAL_COLUMNS
    filters = SAMPLE_FILTERS + ADDITIONAL_FILTERS
    return build_schema_cache_from_fixtures(
        tables=tables,
        columns=columns,
        filters=filters,
        functions=SAMPLE_FUNCTIONS,
    )
