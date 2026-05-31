from app.planner.prompt_builder import build_prompt_context
from app.planner.models import RetrievedContext
from app.schema.schema_models import (
    ColumnMetadata,
    FunctionArgument,
    TableFunctionMetadata,
    TableMetadata,
)


def _make_table(name, schema="github", description="", guide="", req_filters="",
                columns=None):
    tbl = TableMetadata(
        schema_name=schema,
        table_name=name,
        description=description,
        guide=guide,
        required_filters=req_filters,
    )
    if columns:
        for i, (col_name, col_type, col_desc) in enumerate(columns):
            tbl.columns.append(
                ColumnMetadata(
                    schema_name=schema,
                    table_name=name,
                    ordinal_position=i,
                    column_name=col_name,
                    data_type=col_type,
                    description=col_desc,
                )
            )
    return tbl


def _make_func(name="search_issues", schema="github", description="",
               args=None):
    func = TableFunctionMetadata(
        schema_name=schema,
        function_name=name,
        description=description,
    )
    if args:
        func.arguments = [
            FunctionArgument(name=a.get("name"), required=a.get("required", False))
            for a in args
        ]
    return func


class TestBuildPromptContext:
    def test_empty_context(self):
        ctx = RetrievedContext()
        result = build_prompt_context(ctx)
        assert result == ""

    def test_single_table_no_columns(self):
        tbl = _make_table("issues")
        ctx = RetrievedContext(tables=[tbl])
        result = build_prompt_context(ctx)
        assert "Available tables:" in result
        assert "github.issues" in result
        assert "Columns" not in result

    def test_table_with_description_and_filters(self):
        tbl = _make_table(
            "issues",
            description="Repository issues",
            req_filters="owner,repo",
        )
        ctx = RetrievedContext(tables=[tbl])
        result = build_prompt_context(ctx)
        assert "Repository issues" in result
        assert "Required Filters: owner,repo" in result

    def test_table_with_columns(self):
        tbl = _make_table(
            "issues",
            columns=[("id", "Int64", "Issue ID"), ("title", "Utf8", "")]
        )
        ctx = RetrievedContext(tables=[tbl])
        result = build_prompt_context(ctx)
        assert "Columns" in result
        assert "id:Int64" in result
        assert "title:Utf8" in result
        assert "(Issue ID)" in result

    def test_table_with_guide(self):
        tbl = _make_table("issues", guide="Requires owner and repo.")
        ctx = RetrievedContext(tables=[tbl])
        result = build_prompt_context(ctx)
        assert "Guide: Requires owner and repo." in result

    def test_function_with_args(self):
        func = _make_func(
            "search_issues",
            description="Search GitHub issues.",
            args=[{"name": "q", "required": True}, {"name": "mode", "required": False}],
        )
        ctx = RetrievedContext(functions=[func])
        result = build_prompt_context(ctx)
        assert "Available functions:" in result
        assert "github.search_issues" in result
        assert "Search GitHub issues." in result
        assert "q" in result
        assert "[mode]" in result

    def test_function_without_args(self):
        func = _make_func("search_code", description="Search code.")
        ctx = RetrievedContext(functions=[func])
        result = build_prompt_context(ctx)
        assert "github.search_code" in result
        assert "Search code." in result

    def test_tables_and_functions(self):
        tbl = _make_table("issues")
        func = _make_func("search_issues")
        ctx = RetrievedContext(tables=[tbl], functions=[func])
        result = build_prompt_context(ctx)
        assert "Available tables:" in result
        assert "Available functions:" in result
        assert "github.issues" in result
        assert "github.search_issues" in result

    def test_table_column_limit(self):
        many_cols = [
            (f"col{i}", "Utf8", "") for i in range(30)
        ]
        tbl = _make_table("issues", columns=many_cols)
        ctx = RetrievedContext(tables=[tbl])
        result = build_prompt_context(ctx)
        assert "showing 20" in result
        assert "..." in result

    def test_multiple_tables(self):
        tbl1 = _make_table("issues", schema="github")
        tbl2 = _make_table("pages", schema="notion")
        ctx = RetrievedContext(tables=[tbl1, tbl2])
        result = build_prompt_context(ctx)
        assert "github.issues" in result
        assert "notion.pages" in result

    def test_no_duplicate_table_section(self):
        tbl = _make_table("issues")
        ctx = RetrievedContext(tables=[tbl])
        result = build_prompt_context(ctx)
        assert result.count("Available tables:") == 1
