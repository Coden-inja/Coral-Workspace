from app.sql.validator import validate


class TestValidate:
    def test_valid_select(self, schema_cache):
        result = validate("SELECT * FROM github.issues LIMIT 20", schema_cache)
        assert result.valid is True
        assert result.errors == []

    def test_valid_select_with_schema(self, schema_cache):
        result = validate("SELECT * FROM notion.pages LIMIT 10", schema_cache)
        assert result.valid is True

    def test_rejects_insert(self, schema_cache):
        result = validate("INSERT INTO github.issues VALUES (1)", schema_cache)
        assert result.valid is False
        assert any("INSERT" in e for e in result.errors)

    def test_rejects_update(self, schema_cache):
        result = validate("UPDATE github.issues SET title = 'x'", schema_cache)
        assert result.valid is False

    def test_rejects_delete(self, schema_cache):
        result = validate("DELETE FROM github.issues", schema_cache)
        assert result.valid is False

    def test_rejects_drop(self, schema_cache):
        result = validate("DROP TABLE github.issues", schema_cache)
        assert result.valid is False

    def test_rejects_alter(self, schema_cache):
        result = validate("ALTER TABLE github.issues ADD COLUMN x INT", schema_cache)
        assert result.valid is False

    def test_rejects_create(self, schema_cache):
        result = validate("CREATE TABLE t (id INT)", schema_cache)
        assert result.valid is False

    def test_rejects_multiple_statements(self, schema_cache):
        result = validate(
            "SELECT * FROM github.issues;\nSELECT * FROM notion.pages",
            schema_cache,
        )
        assert result.valid is False
        assert any("Multiple statements" in e for e in result.errors)

    def test_allows_single_statement_with_trailing_semicolon(self, schema_cache):
        result = validate("SELECT * FROM github.issues;", schema_cache)
        assert result.valid is True

    def test_rejects_nonexistent_table(self, schema_cache):
        result = validate("SELECT * FROM github.nonexistent_table", schema_cache)
        assert result.valid is False
        assert any("does not exist" in e for e in result.errors)

    def test_allows_table_without_schema(self, schema_cache):
        result = validate("SELECT 1", schema_cache)
        assert result.valid is True

    def test_rejects_empty_sql(self, schema_cache):
        result = validate("", schema_cache)
        assert result.valid is False
        assert any("Empty" in e for e in result.errors)

    def test_rejects_whitespace_only(self, schema_cache):
        result = validate("   \n  ", schema_cache)
        assert result.valid is False

    def test_strips_comments(self, schema_cache):
        result = validate(
            "-- this is a comment\nSELECT * FROM github.issues LIMIT 20",
            schema_cache,
        )
        assert result.valid is True

    def test_valid_with_function(self, schema_cache):
        result = validate(
            "SELECT * FROM github.search_issues(q => 'auth') LIMIT 20",
            schema_cache,
        )
        assert result.valid is True
