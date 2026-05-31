from app.planner.planner import QueryPlanner, _collect_required_filters
from app.planner.models import RetrievedContext
from app.schema.schema_models import FilterMetadata


class TestCollectRequiredFilters:
    def test_no_filters(self):
        ctx = RetrievedContext()
        assert _collect_required_filters(ctx) == []

    def test_all_required(self):
        ctx = RetrievedContext(
            filters=[
                FilterMetadata(
                    schema_name="g", table_name="t",
                    filter_name="owner", filter_mode="eq", is_required=True,
                ),
                FilterMetadata(
                    schema_name="g", table_name="t",
                    filter_name="repo", filter_mode="eq", is_required=True,
                ),
            ]
        )
        result = _collect_required_filters(ctx)
        assert "owner" in result
        assert "repo" in result

    def test_optional_excluded(self):
        ctx = RetrievedContext(
            filters=[
                FilterMetadata(
                    schema_name="g", table_name="t",
                    filter_name="state", filter_mode="eq", is_required=False,
                ),
            ]
        )
        assert _collect_required_filters(ctx) == []

    def test_deduplicates(self):
        ctx = RetrievedContext(
            filters=[
                FilterMetadata(
                    schema_name="g", table_name="t1",
                    filter_name="owner", filter_mode="eq", is_required=True,
                ),
                FilterMetadata(
                    schema_name="g", table_name="t2",
                    filter_name="owner", filter_mode="eq", is_required=True,
                ),
            ]
        )
        result = _collect_required_filters(ctx)
        assert result == ["owner"]


class TestQueryPlanner:
    def test_create_plan_matches_table(self, schema_cache):
        planner = QueryPlanner(schema_cache=schema_cache)
        plan = planner.create_plan("show issues")
        assert "github.issues" in plan.candidate_tables
        assert "Available tables:" in plan.prompt_context

    def test_create_plan_matches_function(self, schema_cache):
        planner = QueryPlanner(schema_cache=schema_cache)
        plan = planner.create_plan("search issues")
        assert "github.search_issues" in plan.candidate_functions

    def test_create_plan_includes_required_filters(self, schema_cache):
        planner = QueryPlanner(schema_cache=schema_cache)
        plan = planner.create_plan("issues")
        assert "owner" in plan.required_filters
        assert "repo" in plan.required_filters

    def test_create_plan_no_match(self, schema_cache):
        planner = QueryPlanner(schema_cache=schema_cache)
        plan = planner.create_plan("xyznonexistent12345")
        assert plan.candidate_tables == []
        assert plan.candidate_functions == []
        assert plan.required_filters == []
        assert plan.prompt_context == ""

    def test_create_plan_question_preserved(self, schema_cache):
        planner = QueryPlanner(schema_cache=schema_cache)
        plan = planner.create_plan("find authentication issues")
        assert plan.user_question == "find authentication issues"

    def test_create_plan_max_tables(self, schema_cache):
        planner = QueryPlanner(schema_cache=schema_cache)
        plan = planner.create_plan("issues pulls commits", max_tables=2)
        assert len(plan.candidate_tables) <= 2

    def test_create_plan_multiple_matches(self, schema_cache):
        planner = QueryPlanner(schema_cache=schema_cache)
        plan = planner.create_plan("workflows")
        assert "github.workflows" in plan.candidate_tables

    def test_plan_has_prompt_context(self, schema_cache):
        planner = QueryPlanner(schema_cache=schema_cache)
        plan = planner.create_plan("issues")
        assert len(plan.prompt_context) > 0
