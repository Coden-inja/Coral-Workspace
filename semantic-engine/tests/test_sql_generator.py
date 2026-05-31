from app.planner.models import QueryPlan
from app.sql.generator import (
    _build_function_sql,
    _build_table_sql,
    _extract_query_arg,
    _has_search_intent,
    _tokenize,
    generate,
)


class TestTokenize:
    def test_removes_stop_words(self):
        tokens = _tokenize("show github issues for me")
        assert "github" in tokens
        assert "issues" in tokens
        assert all(w not in tokens for w in ["show", "for", "me"])

    def test_removes_search_verb(self):
        tokens = _tokenize("search authentication issues")
        assert "authentication" in tokens
        assert "issues" in tokens
        assert "search" not in tokens


class TestHasSearchIntent:
    def test_search(self):
        assert _has_search_intent("search for issues") is True

    def test_find(self):
        assert _has_search_intent("find users") is True

    def test_lookup(self):
        assert _has_search_intent("lookup repo") is True

    def test_show(self):
        assert _has_search_intent("show me issues") is False

    def test_list(self):
        assert _has_search_intent("list all tables") is False


class TestExtractQueryArg:
    def test_removes_known_names(self):
        result = _extract_query_arg(
            "search authentication issues",
            ["github.issues"],
            ["github.search_issues"],
        )
        assert "issues" not in result
        assert "authentication" in result

    def test_removes_search_verb(self):
        result = _extract_query_arg(
            "search code for authentication",
            [],
            [],
        )
        assert "search" not in result
        assert "authentication" in result

    def test_all_removed_uses_default(self):
        result = _extract_query_arg(
            "search issues",
            ["github.issues"],
            ["github.search_issues"],
        )
        assert result == "query"

    def test_question_no_tokens(self):
        result = _extract_query_arg("search", [], [])
        assert result == "query"


class TestBuildTableSQL:
    def test_basic(self):
        sql = _build_table_sql("github.issues")
        assert "SELECT *" in sql
        assert "FROM github.issues" in sql
        assert "LIMIT 20" in sql

    def test_notion_table(self):
        sql = _build_table_sql("notion.pages")
        assert "FROM notion.pages" in sql


class TestBuildFunctionSQL:
    def test_basic(self):
        sql = _build_function_sql("github.search_issues", "authentication")
        assert "SELECT *" in sql
        assert "github.search_issues" in sql
        assert "q => 'authentication'" in sql
        assert "LIMIT 20" in sql

    def test_escapes_single_quotes(self):
        sql = _build_function_sql("github.search_code", "it's a test")
        assert "it''s a test" in sql

    def test_multi_word_arg(self):
        sql = _build_function_sql("github.search_issues", "authentication issues")
        assert "q => 'authentication issues'" in sql


class TestGenerate:
    def test_table_no_search(self, schema_cache):
        plan = QueryPlan(
            user_question="show issues",
            candidate_tables=["github.issues"],
            candidate_functions=[],
            required_filters=["owner", "repo"],
        )
        result = generate(plan, schema_cache)
        assert "FROM github.issues" in result.sql
        assert "SELECT *" in result.sql
        assert "LIMIT 20" in result.sql
        assert result.tables_used == ["github.issues"]

    def test_table_with_missing_filters_warning(self, schema_cache):
        plan = QueryPlan(
            user_question="show issues",
            candidate_tables=["github.issues"],
            candidate_functions=[],
            required_filters=["owner", "repo"],
        )
        result = generate(plan, schema_cache)
        assert len(result.warnings) == 1
        assert "Missing required filters" in result.warnings[0]
        assert "owner" in result.warnings[0]
        assert "repo" in result.warnings[0]

    def test_table_no_required_filters(self, schema_cache):
        plan = QueryPlan(
            user_question="list notion pages",
            candidate_tables=["notion.pages"],
            candidate_functions=[],
            required_filters=[],
        )
        result = generate(plan, schema_cache)
        assert result.warnings == []
        assert "FROM notion.pages" in result.sql

    def test_function_with_search(self, schema_cache):
        plan = QueryPlan(
            user_question="search authentication issues",
            candidate_tables=["github.issues"],
            candidate_functions=["github.search_issues"],
            required_filters=["owner", "repo"],
        )
        result = generate(plan, schema_cache)
        assert "github.search_issues" in result.sql
        assert "q => 'authentication'" in result.sql
        assert result.tables_used == ["github.search_issues"]
        assert result.required_filters == ["owner", "repo"]

    def test_no_match(self, schema_cache):
        plan = QueryPlan(
            user_question="xyznonexistent",
            candidate_tables=[],
            candidate_functions=[],
            required_filters=[],
        )
        result = generate(plan, schema_cache)
        assert result.sql == "SELECT 1"
        assert result.tables_used == []
        assert len(result.warnings) == 1
        assert "No matching tables or functions" in result.warnings[0]

    def test_function_with_find(self, schema_cache):
        plan = QueryPlan(
            user_question="find failed authentication",
            candidate_tables=["github.repos"],
            candidate_functions=["github.search_repositories"],
            required_filters=[],
        )
        result = generate(plan, schema_cache)
        assert "github.search_repositories" in result.sql
        assert "q => 'failed authentication'" in result.sql

    def test_show_intent_uses_table(self, schema_cache):
        plan = QueryPlan(
            user_question="show github issues",
            candidate_tables=["github.issues"],
            candidate_functions=[],
            required_filters=["owner", "repo"],
        )
        result = generate(plan, schema_cache)
        assert "FROM github.issues" in result.sql
        assert result.tables_used == ["github.issues"]

    def test_required_filters_in_result(self, schema_cache):
        plan = QueryPlan(
            user_question="show issues",
            candidate_tables=["github.issues"],
            candidate_functions=[],
            required_filters=["owner", "repo"],
        )
        result = generate(plan, schema_cache)
        assert "owner" in result.required_filters
        assert "repo" in result.required_filters

    def test_function_sql_has_required_filters(self, schema_cache):
        plan = QueryPlan(
            user_question="search issues",
            candidate_tables=["github.issues"],
            candidate_functions=["github.search_issues"],
            required_filters=["owner", "repo"],
        )
        result = generate(plan, schema_cache)
        assert "owner" in result.required_filters
        assert "repo" in result.required_filters
