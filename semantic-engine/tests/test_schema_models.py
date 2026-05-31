from __future__ import annotations

from app.schema.schema_models import (
    ColumnMetadata,
    FilterMetadata,
    FunctionArgument,
    ResultColumn,
    SchemaCatalog,
    TableFunctionMetadata,
    TableMetadata,
)


class TestColumnMetadata:
    def test_basic_column(self):
        col = ColumnMetadata(
            schema_name="github",
            table_name="issues",
            ordinal_position=0,
            column_name="id",
            data_type="Int64",
        )
        assert col.schema_name == "github"
        assert col.data_type == "Int64"
        assert col.is_nullable is True
        assert col.is_virtual is False

    def test_bool_coercion_from_string(self):
        col = ColumnMetadata(
            schema_name="g",
            table_name="t",
            ordinal_position=0,
            column_name="c",
            data_type="Utf8",
            is_nullable="true",
            is_virtual="false",
            is_required_filter="1",
        )
        assert col.is_nullable is True
        assert col.is_virtual is False
        assert col.is_required_filter is True

    def test_bool_coercion_from_int(self):
        col = ColumnMetadata(
            schema_name="g",
            table_name="t",
            ordinal_position=0,
            column_name="c",
            data_type="Utf8",
            is_nullable=1,
            is_virtual=0,
        )
        assert col.is_nullable is True
        assert col.is_virtual is False


class TestTableMetadata:
    def test_qualified_name(self):
        tbl = TableMetadata(schema_name="github", table_name="issues")
        assert tbl.qualified_name == "github.issues"

    def test_required_filter_list(self):
        tbl = TableMetadata(
            schema_name="github",
            table_name="issues",
            required_filters="owner,repo",
        )
        assert tbl.required_filter_list == ["owner", "repo"]

    def test_empty_required_filter_list(self):
        tbl = TableMetadata(schema_name="github", table_name="issues")
        assert tbl.required_filter_list == []


class TestFilterMetadata:
    def test_basic_filter(self):
        filt = FilterMetadata(
            schema_name="github",
            table_name="issues",
            filter_name="owner",
            filter_mode="equality",
            is_required=True,
        )
        assert filt.is_required is True
        assert filt.filter_mode == "equality"

    def test_bool_coercion(self):
        filt = FilterMetadata(
            schema_name="g",
            table_name="t",
            filter_name="f",
            filter_mode="eq",
            is_required="true",
        )
        assert filt.is_required is True


class TestFunctionArgument:
    def test_basic_arg(self):
        arg = FunctionArgument(name="q", required=True, values=["a", "b"])
        assert arg.name == "q"
        assert arg.required is True
        assert arg.values == ["a", "b"]

    def test_bool_coercion(self):
        arg = FunctionArgument(name="x", required="false")
        assert arg.required is False


class TestResultColumn:
    def test_basic_column(self):
        col = ResultColumn(name="title", type="Utf8", nullable=True)
        assert col.name == "title"
        assert col.type == "Utf8"

    def test_bool_coercion(self):
        col = ResultColumn(name="x", type="Int64", nullable="false")
        assert col.nullable is False


class TestTableFunctionMetadata:
    def test_qualified_name(self):
        func = TableFunctionMetadata(
            schema_name="github", function_name="search_issues"
        )
        assert func.qualified_name == "github.search_issues"

    def test_json_fields_parsed(self):
        func = TableFunctionMetadata(
            schema_name="github",
            function_name="search_issues",
            arguments='[{"name":"q","required":true,"values":[]}]',
            result_columns='[{"name":"title","type":"Utf8","nullable":true,"description":""}]',
        )
        assert len(func.arguments) == 1
        assert func.arguments[0].name == "q"
        assert func.arguments[0].required is True
        assert len(func.result_columns) == 1
        assert func.result_columns[0].name == "title"


class TestSchemaCatalog:
    def test_empty_catalog(self):
        cat = SchemaCatalog()
        assert len(cat.tables) == 0
        assert len(cat.filters) == 0
        assert len(cat.functions) == 0

    def test_add_and_get_table(self):
        cat = SchemaCatalog()
        tbl = TableMetadata(schema_name="github", table_name="issues")
        col = ColumnMetadata(
            schema_name="github",
            table_name="issues",
            ordinal_position=0,
            column_name="id",
            data_type="Int64",
        )
        tbl.columns.append(col)
        cat.add_table(tbl)

        found = cat.get_table("github", "issues")
        assert found is not None
        assert found.qualified_name == "github.issues"
        assert len(found.columns) == 1

    def test_get_table_not_found(self):
        cat = SchemaCatalog()
        assert cat.get_table("github", "nonexistent") is None

    def test_get_columns(self):
        cat = SchemaCatalog()
        col = ColumnMetadata(
            schema_name="g",
            table_name="t",
            ordinal_position=0,
            column_name="c",
            data_type="Utf8",
        )
        tbl = TableMetadata(schema_name="g", table_name="t", columns=[col])
        cat.add_table(tbl)
        columns = cat.get_columns("g", "t")
        assert len(columns) == 1
        assert columns[0].column_name == "c"

    def test_get_columns_empty(self):
        cat = SchemaCatalog()
        assert cat.get_columns("g", "t") == []

    def test_add_and_get_filters(self):
        cat = SchemaCatalog()
        filt = FilterMetadata(
            schema_name="github",
            table_name="issues",
            filter_name="owner",
            filter_mode="equality",
            is_required=True,
        )
        cat.add_filter(filt)
        filters = cat.get_filters("github", "issues")
        assert len(filters) == 1
        assert filters[0].filter_name == "owner"

    def test_get_required_filters(self):
        cat = SchemaCatalog()
        req = FilterMetadata(
            schema_name="g",
            table_name="t",
            filter_name="owner",
            filter_mode="eq",
            is_required=True,
        )
        opt = FilterMetadata(
            schema_name="g",
            table_name="t",
            filter_name="state",
            filter_mode="eq",
            is_required=False,
        )
        cat.add_filter(req)
        cat.add_filter(opt)
        required = cat.get_required_filters("g", "t")
        assert len(required) == 1
        assert required[0].filter_name == "owner"

    def test_add_and_get_functions(self):
        cat = SchemaCatalog()
        func = TableFunctionMetadata(
            schema_name="github", function_name="search_issues"
        )
        cat.add_function(func)
        functions = cat.get_functions("github")
        assert len(functions) == 1
        assert functions[0].function_name == "search_issues"

    def test_get_functions_no_match(self):
        cat = SchemaCatalog()
        func = TableFunctionMetadata(
            schema_name="github", function_name="search_issues"
        )
        cat.add_function(func)
        assert cat.get_functions("notion") == []

    def test_search_tables_by_name(self):
        cat = SchemaCatalog()
        cat.add_table(TableMetadata(schema_name="github", table_name="issues"))
        cat.add_table(TableMetadata(schema_name="github", table_name="pulls"))
        results = cat.search_tables("issue")
        assert len(results) == 1
        assert results[0].table_name == "issues"

    def test_search_tables_by_description(self):
        cat = SchemaCatalog()
        cat.add_table(
            TableMetadata(
                schema_name="github",
                table_name="bugs",
                description="Tracked issues and bugs",
            )
        )
        results = cat.search_tables("bugs")
        assert len(results) == 1

    def test_search_tables_no_match(self):
        cat = SchemaCatalog()
        cat.add_table(TableMetadata(schema_name="github", table_name="issues"))
        assert cat.search_tables("nonexistent") == []

    def test_search_functions(self):
        cat = SchemaCatalog()
        cat.add_function(
            TableFunctionMetadata(
                schema_name="github",
                function_name="search_issues",
                description="Search GitHub issues",
            )
        )
        results = cat.search_functions("search")
        assert len(results) == 1
        assert results[0].function_name == "search_issues"
