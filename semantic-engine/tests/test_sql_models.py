from app.sql.models import GeneratedSQL, SQLValidationResult


class TestGeneratedSQL:
    def test_defaults(self):
        sql = GeneratedSQL(sql="SELECT 1")
        assert sql.sql == "SELECT 1"
        assert sql.tables_used == []
        assert sql.required_filters == []
        assert sql.warnings == []

    def test_full(self):
        sql = GeneratedSQL(
            sql="SELECT * FROM github.issues LIMIT 20",
            tables_used=["github.issues"],
            required_filters=["owner", "repo"],
            warnings=["Missing required filters: owner"],
        )
        assert "github.issues" in sql.tables_used
        assert "owner" in sql.required_filters
        assert len(sql.warnings) == 1


class TestSQLValidationResult:
    def test_valid_default(self):
        r = SQLValidationResult(valid=True)
        assert r.valid is True
        assert r.errors == []

    def test_invalid_with_errors(self):
        r = SQLValidationResult(valid=False, errors=["Bad SQL"])
        assert r.valid is False
        assert r.errors == ["Bad SQL"]
