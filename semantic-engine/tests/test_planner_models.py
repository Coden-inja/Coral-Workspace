from app.planner.models import RetrievedContext, QueryPlan
from app.schema.schema_models import TableMetadata


class TestRetrievedContext:
    def test_empty_context(self):
        ctx = RetrievedContext()
        assert ctx.tables == []
        assert ctx.columns == []
        assert ctx.filters == []
        assert ctx.functions == []

    def test_with_tables(self):
        tbl = TableMetadata(schema_name="g", table_name="t")
        ctx = RetrievedContext(tables=[tbl])
        assert len(ctx.tables) == 1
        assert ctx.tables[0].qualified_name == "g.t"


class TestQueryPlan:
    def test_defaults(self):
        plan = QueryPlan(user_question="test")
        assert plan.user_question == "test"
        assert plan.candidate_tables == []
        assert plan.candidate_functions == []
        assert plan.required_filters == []
        assert plan.prompt_context == ""

    def test_full_plan(self):
        plan = QueryPlan(
            user_question="show issues",
            candidate_tables=["github.issues"],
            candidate_functions=["github.search_issues"],
            required_filters=["owner", "repo"],
            prompt_context="Available tables:\n  github.issues",
        )
        assert plan.user_question == "show issues"
        assert "github.issues" in plan.candidate_tables
        assert "owner" in plan.required_filters
        assert "Available tables" in plan.prompt_context
