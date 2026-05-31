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


class TestPlanEndpoint:
    def test_plan_endpoint_returns_200(self, client):
        resp = client.post("/query/plan", json={"query": "show issues"})
        assert resp.status_code == 200

    def test_plan_endpoint_matches_table(self, client):
        resp = client.post("/query/plan", json={"query": "issues"})
        data = resp.json()
        assert "github.issues" in data["candidate_tables"]

    def test_plan_endpoint_includes_filters(self, client):
        resp = client.post("/query/plan", json={"query": "issues"})
        data = resp.json()
        assert "owner" in data["required_filters"]
        assert "repo" in data["required_filters"]

    def test_plan_endpoint_includes_prompt_context(self, client):
        resp = client.post("/query/plan", json={"query": "issues"})
        data = resp.json()
        assert "Available tables:" in data["prompt_context"]
        assert "github.issues" in data["prompt_context"]

    def test_plan_endpoint_matches_functions(self, client):
        resp = client.post("/query/plan", json={"query": "search issues"})
        data = resp.json()
        assert "github.search_issues" in data["candidate_functions"]

    def test_plan_endpoint_no_match(self, client):
        resp = client.post("/query/plan", json={"query": "xyznonexistent12345"})
        data = resp.json()
        assert data["candidate_tables"] == []
        assert data["candidate_functions"] == []
        assert data["required_filters"] == []
        assert data["prompt_context"] == ""

    def test_plan_endpoint_authentication_match(self, client):
        resp = client.post("/query/plan", json={"query": "authentication"})
        data = resp.json()
        assert "github.authentication" in data["candidate_tables"]

    def test_plan_endpoint_requires_query(self, client):
        resp = client.post("/query/plan", json={})
        assert resp.status_code == 422

    def test_plan_endpoint_workflows_match(self, client):
        resp = client.post("/query/plan", json={"query": "workflows actions"})
        data = resp.json()
        assert "github.workflows" in data["candidate_tables"]
