from __future__ import annotations

from unittest.mock import patch

import pytest

from app.schema.schema_cache import SchemaCache
from app.schema.schema_models import (
    ColumnMetadata,
    FilterMetadata,
    SchemaCatalog,
    TableFunctionMetadata,
    TableMetadata,
)


@pytest.fixture(autouse=True)
def reset_cache():
    SchemaCache.reset_instance()
    yield
    SchemaCache.reset_instance()


def _make_catalog() -> SchemaCatalog:
    cat = SchemaCatalog()
    tbl = TableMetadata(
        schema_name="github",
        table_name="issues",
        description="Track issues",
        guide="Filter by owner and repo",
        required_filters="owner,repo",
    )
    tbl.columns = [
        ColumnMetadata(
            schema_name="github",
            table_name="issues",
            ordinal_position=0,
            column_name="id",
            data_type="Int64",
            is_nullable=False,
        ),
        ColumnMetadata(
            schema_name="github",
            table_name="issues",
            ordinal_position=1,
            column_name="title",
            data_type="Utf8",
        ),
    ]
    cat.add_table(tbl)

    cat.add_table(
        TableMetadata(
            schema_name="github",
            table_name="pulls",
            description="Pull requests",
        )
    )

    cat.add_filter(
        FilterMetadata(
            schema_name="github",
            table_name="issues",
            filter_name="owner",
            filter_mode="equality",
            is_required=True,
        )
    )
    cat.add_filter(
        FilterMetadata(
            schema_name="github",
            table_name="issues",
            filter_name="repo",
            filter_mode="equality",
            is_required=True,
        )
    )

    cat.add_function(
        TableFunctionMetadata(
            schema_name="github",
            function_name="search_issues",
            description="Search issues",
        )
    )

    return cat


class TestSchemaCache:
    def test_singleton(self):
        cache1 = SchemaCache.get_instance()
        cache2 = SchemaCache.get_instance()
        assert cache1 is cache2

    def test_reset_instance(self):
        cache1 = SchemaCache.get_instance()
        SchemaCache.reset_instance()
        cache2 = SchemaCache.get_instance()
        assert cache1 is not cache2

    def test_configure_and_load(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            result = cache.load()

        assert len(result.tables) == 2
        assert cache.catalog is result

    def test_tables_property(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            assert len(cache.tables) == 2

    def test_filters_property(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            assert len(cache.filters) == 1

    def test_functions_property(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            assert len(cache.functions) == 1

    def test_get_table(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            tbl = cache.get_table("github", "issues")
            assert tbl is not None
            assert tbl.table_name == "issues"

    def test_get_table_not_found(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            assert cache.get_table("github", "nonexistent") is None

    def test_get_columns(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            cols = cache.get_columns("github", "issues")
            assert len(cols) == 2

    def test_get_filters(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            filters = cache.get_filters("github", "issues")
            assert len(filters) == 2

    def test_get_required_filters(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            required = cache.get_required_filters("github", "issues")
            assert len(required) == 2

    def test_search_tables(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            results = cache.search_tables("issue")
            assert len(results) == 1
            assert results[0].table_name == "issues"

    def test_search_functions(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            results = cache.search_functions("search")
            assert len(results) == 1

    def test_reload(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            result = cache.reload()
            assert result is not None

    def test_format_schema_context_with_table(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            ctx = cache.format_schema_context("github", "issues")
            assert "github.issues" in ctx
            assert "Track issues" in ctx
            assert "owner,repo" in ctx
            assert "id" in ctx
            assert "Int64" in ctx

    def test_format_schema_context_missing_table(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            ctx = cache.format_schema_context("github", "nonexistent")
            assert "not found" in ctx

    def test_format_schema_context_for_prompt(self):
        catalog = _make_catalog()
        with patch("app.schema.schema_cache.load_schema", return_value=catalog):
            cache = SchemaCache.get_instance()
            cache.configure(coral_binary="coral")
            ctx = cache.format_schema_context_for_prompt(
                ["github.issues", "github.pulls"]
            )
            assert "github.issues" in ctx
            assert "github.pulls" in ctx
            assert "id:Int64" in ctx
