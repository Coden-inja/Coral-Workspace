import pytest
from fastapi.testclient import TestClient

from app.dependencies import get_schema_cache
from app.main import app
from app.schema.schema_cache import SchemaCache


@pytest.fixture(autouse=True)
def _reset_schema_cache():
    SchemaCache.reset_instance()


@pytest.fixture
def client(schema_cache: SchemaCache):
    app.dependency_overrides[get_schema_cache] = lambda: schema_cache
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


class TestSQLEndpoint:
    def test_sql_endpoint_returns_200(self, client):
        resp = client.post("/query/sql", json={"query": "show github issues"})
        assert resp.status_code == 200

    def test_sql_returns_select_statement(self, client):
        resp = client.post("/query/sql", json={"query": "show github issues"})
        data = resp.json()
        assert "SELECT" in data["sql"]
        assert "FROM github.issues" in data["sql"]
        assert "LIMIT 20" in data["sql"]

    def test_sql_includes_tables_used(self, client):
        resp = client.post("/query/sql", json={"query": "show github issues"})
        data = resp.json()
        assert "github.issues" in data["tables_used"]

    def test_sql_includes_required_filters(self, client):
        resp = client.post("/query/sql", json={"query": "show issues"})
        data = resp.json()
        assert "owner" in data["required_filters"]
        assert "repo" in data["required_filters"]

    def test_sql_warns_missing_filters(self, client):
        resp = client.post("/query/sql", json={"query": "show issues"})
        data = resp.json()
        assert len(data["warnings"]) > 0
        assert any("Missing required filters" in w for w in data["warnings"])

    def test_sql_search_function(self, client):
        resp = client.post("/query/sql", json={"query": "search project issues"})
        data = resp.json()
        assert "github.search_issues" in data["sql"]
        assert "q =>" in data["sql"]
        assert "project" in data["sql"]

    def test_sql_no_match(self, client):
        resp = client.post("/query/sql", json={"query": "xyznonexistent12345"})
        data = resp.json()
        assert data["sql"] == "SELECT 1"
        assert data["tables_used"] == []
        assert len(data["warnings"]) > 0

    def test_sql_notion_table(self, client):
        resp = client.post("/query/sql", json={"query": "list notion pages"})
        data = resp.json()
        assert "FROM notion.pages" in data["sql"]

    def test_requires_query(self, client):
        resp = client.post("/query/sql", json={})
        assert resp.status_code == 422

    def test_sql_workflows(self, client):
        resp = client.post("/query/sql", json={"query": "show workflows"})
        data = resp.json()
        assert "FROM github.workflows" in data["sql"]
        assert "owner" in data["required_filters"]
