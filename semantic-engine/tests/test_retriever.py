from app.planner.retriever import _score_function, _score_table, _tokenize, retrieve


class TestTokenize:
    def test_basic(self):
        tokens = _tokenize("show authentication issues")
        assert "authentication" in tokens
        assert "issues" in tokens
        assert "show" not in tokens

    def test_stop_words_removed(self):
        tokens = _tokenize("list all the issues for me")
        assert "issues" in tokens
        assert all(w not in tokens for w in ["list", "all", "the", "for", "me"])

    def test_short_tokens_removed(self):
        tokens = _tokenize("a b cd ef gh")
        assert tokens == ["cd", "ef", "gh"]

    def test_camel_case_and_underscores(self):
        tokens = _tokenize("search_issues PR_approval")
        assert "search_issues" in tokens
        assert "pr_approval" in tokens

    def test_empty_input(self):
        assert _tokenize("") == []

    def test_only_stop_words(self):
        assert _tokenize("a an the") == []


class TestScoreTable:
    def test_exact_name_match(self):
        tbl = _make_table("issues")
        tokens = ["issues"]
        score = _score_table(tbl, tokens, {})
        assert score == 20.0

    def test_substring_name_match(self):
        tbl = _make_table("issues_list_comments")
        tokens = ["issues"]
        score = _score_table(tbl, tokens, {})
        assert score >= 10.0

    def test_description_match(self):
        tbl = _make_table("t1", description="authentication tokens")
        tokens = ["authentication"]
        score = _score_table(tbl, tokens, {})
        assert score >= 4.0

    def test_guide_match(self):
        tbl = _make_table("t1", guide="requires owner and repo")
        tokens = ["owner"]
        score = _score_table(tbl, tokens, {})
        assert score >= 2.0

    def test_column_name_match(self):
        tbl = _make_table("t1", columns=[("auth_token", "Utf8")])
        tokens = ["auth"]
        score = _score_table(tbl, tokens, {})
        assert score >= 3.0

    def test_no_match(self):
        tbl = _make_table("issues")
        score = _score_table(tbl, ["zzzzznotfound"], {})
        assert score == 0.0

    def test_column_match_cache_reused(self):
        cache: dict[str, set[str]] = {}
        tbl = _make_table("t1", columns=[("token", "Utf8")])
        _score_table(tbl, ["token"], cache)
        assert "t1.t1" in cache


def _make_table(name, description="", guide="", columns=None):
    from app.schema.schema_models import ColumnMetadata, TableMetadata

    tbl = TableMetadata(
        schema_name="t1",
        table_name=name,
        description=description,
        guide=guide,
    )
    if columns:
        for i, (col_name, col_type) in enumerate(columns):
            tbl.columns.append(
                ColumnMetadata(
                    schema_name="t1",
                    table_name=name,
                    ordinal_position=i,
                    column_name=col_name,
                    data_type=col_type,
                )
            )
    return tbl


class TestScoreFunction:
    def test_exact_name_match(self):
        func = _make_func("search_issues")
        score = _score_function(func, ["search_issues"])
        assert score == 20.0

    def test_name_substring(self):
        func = _make_func("search_issues")
        score = _score_function(func, ["issue"])
        assert score >= 10.0

    def test_description_match(self):
        func = _make_func("sf", description="search code in repositories")
        score = _score_function(func, ["repositories"])
        assert score >= 4.0

    def test_no_match(self):
        func = _make_func("search_issues")
        score = _score_function(func, ["nonexistent"])
        assert score == 0.0


def _make_func(name, description=""):
    from app.schema.schema_models import TableFunctionMetadata

    return TableFunctionMetadata(
        schema_name="github", function_name=name, description=description
    )


class TestRetrieve:
    def test_empty_question(self, schema_cache):
        ctx = retrieve("", schema_cache)
        assert len(ctx.tables) == 0
        assert len(ctx.functions) == 0

    def test_only_stop_words(self, schema_cache):
        ctx = retrieve("a an the for me", schema_cache)
        assert len(ctx.tables) == 0

    def test_matches_table_name(self, schema_cache):
        ctx = retrieve("issues", schema_cache)
        names = [t.qualified_name for t in ctx.tables]
        assert "github.issues" in names

    def test_matches_table_description(self, schema_cache):
        ctx = retrieve("pull requests", schema_cache)
        names = [t.qualified_name for t in ctx.tables]
        assert "github.pulls" in names

    def test_matches_function(self, schema_cache):
        ctx = retrieve("search issues", schema_cache)
        names = [f.qualified_name for f in ctx.functions]
        assert "github.search_issues" in names

    def test_returns_filters_for_matched_tables(self, schema_cache):
        ctx = retrieve("issues", schema_cache)
        filter_names = {f.filter_name for f in ctx.filters}
        assert "owner" in filter_names
        assert "repo" in filter_names

    def test_scored_ranking(self, schema_cache):
        ctx = retrieve("authentication", schema_cache)
        names = [t.qualified_name for t in ctx.tables]
        assert "github.authentication" in names

    def test_max_tables(self, schema_cache):
        ctx = retrieve("issues authentication commits pulls", schema_cache, max_tables=2)
        assert len(ctx.tables) <= 2

    def test_columns_from_matched_tables(self, schema_cache):
        ctx = retrieve("issues", schema_cache)
        col_names = {c.column_name for c in ctx.columns}
        assert "id" in col_names
        assert "title" in col_names

    def test_columns_ranked(self, schema_cache):
        ctx = retrieve("title issues", schema_cache)
        if ctx.columns:
            assert ctx.columns[0].column_name == "title"
