from __future__ import annotations

import json
from unittest.mock import patch

from app.schema.schema_loader import load_schema


def _mock_execute_side_effect(sql: str, coral_binary: str = "coral"):
    if "FROM coral.tables" in sql:
        return [
            {
                "schema_name": "github",
                "table_name": "issues",
                "description": "List issues in a repository",
                "guide": "Requires owner and repo.",
                "required_filters": "owner,repo",
                "search_limits_json": None,
            },
            {
                "schema_name": "notion",
                "table_name": "pages",
                "description": "List Notion pages",
                "guide": "",
                "required_filters": "",
                "search_limits_json": None,
            },
        ]
    if "FROM coral.columns" in sql:
        return [
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
                "description": "",
                "filter_mode": None,
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
    if "FROM coral.filters" in sql:
        return [
            {
                "schema_name": "github",
                "table_name": "issues",
                "filter_name": "owner",
                "filter_mode": "equality",
                "is_required": True,
                "data_type": "Utf8",
                "description": "",
            },
            {
                "schema_name": "github",
                "table_name": "issues",
                "filter_name": "repo",
                "filter_mode": "equality",
                "is_required": True,
                "data_type": "Utf8",
                "description": "",
            },
        ]
    if "FROM coral.table_functions" in sql:
        return [
            {
                "schema_name": "github",
                "function_name": "search_issues",
                "description": "Search GitHub issues.",
                "arguments_json": json.dumps(
                    [{"name": "q", "required": True, "values": []}]
                ),
                "result_columns_json": json.dumps(
                    [{"name": "title", "type": "Utf8", "nullable": True, "description": ""}]
                ),
                "kind": "table",
                "search_limits_json": None,
            }
        ]
    return []


@patch("app.schema.schema_loader.execute_sql")
def test_load_schema(mock_execute_sql):
    mock_execute_sql.side_effect = _mock_execute_side_effect

    catalog = load_schema(coral_binary="coral")

    assert len(catalog.tables) == 2
    assert len(catalog.filters) == 1
    assert len(catalog.functions) == 1

    issues = catalog.get_table("github", "issues")
    assert issues is not None
    assert issues.description == "List issues in a repository"
    assert issues.required_filters == "owner,repo"
    assert len(issues.columns) == 2

    col_names = [c.column_name for c in issues.columns]
    assert "id" in col_names
    assert "title" in col_names

    id_col = issues.columns[0]
    assert id_col.data_type == "Int64"
    assert id_col.is_nullable is False

    filters = catalog.get_filters("github", "issues")
    assert len(filters) == 2
    assert filters[0].filter_name == "owner"
    assert filters[0].is_required is True

    required = catalog.get_required_filters("github", "issues")
    assert len(required) == 2

    pages = catalog.get_table("notion", "pages")
    assert pages is not None
    assert len(pages.columns) == 1

    funcs = catalog.get_functions("github")
    assert len(funcs) == 1
    assert funcs[0].function_name == "search_issues"
    assert len(funcs[0].arguments) == 1
    assert funcs[0].arguments[0].name == "q"


@patch("app.schema.schema_loader.execute_sql")
def test_load_schema_with_query_failures(mock_execute_sql):
    call_count = 0

    def side_effect(sql, coral_binary="coral"):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise RuntimeError("Simulated failure")
        return []

    mock_execute_sql.side_effect = side_effect

    catalog = load_schema(coral_binary="coral")
    assert len(catalog.tables) == 0
    assert len(catalog.filters) == 0
    assert len(catalog.functions) == 0
