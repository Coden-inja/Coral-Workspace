from __future__ import annotations

from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from app.dependencies import get_coral_client, get_schema_cache
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


def _make_mock_coral(results: list[dict] | None = None, exc: Exception | None = None):
    mock = AsyncMock()
    if exc is not None:
        mock.execute_sql.side_effect = exc
    else:
        mock.execute_sql.return_value = results or []
    return mock


class TestQueryEndpoint:
    def test_query_success_with_results(self, client, schema_cache):
        mock_results = [
            {"id": 1, "title": "Fix login bug", "state": "open"},
            {"id": 2, "title": "Add tests", "state": "closed"},
        ]
        mock_coral = _make_mock_coral(results=mock_results)
        app.dependency_overrides[get_coral_client] = lambda: mock_coral

        resp = client.post("/query", json={"query": "show github issues"})
        assert resp.status_code == 200
        data = resp.json()

        assert data["generated_sql"] == "SELECT *\nFROM github.issues\nLIMIT 20"
        assert data["query_results"] == mock_results
        assert data["confidence"] == 1.0
        assert "**Rows returned:** 2" in data["answer"]
        assert "Fix login bug" in data["answer"]
        assert "Add tests" in data["answer"]

    def test_query_success_empty_results(self, client, schema_cache):
        mock_coral = _make_mock_coral(results=[])
        app.dependency_overrides[get_coral_client] = lambda: mock_coral

        resp = client.post("/query", json={"query": "show github issues"})
        assert resp.status_code == 200
        data = resp.json()

        assert data["query_results"] == []
        assert data["confidence"] == 0.5
        assert "returned no results" in data["answer"]

    def test_query_function_path(self, client, schema_cache):
        mock_results = [{"title": "auth fix", "state": "open"}]
        mock_coral = _make_mock_coral(results=mock_results)
        app.dependency_overrides[get_coral_client] = lambda: mock_coral

        resp = client.post("/query", json={"query": "search authentication issues"})
        assert resp.status_code == 200
        data = resp.json()

        assert "github.search_issues" in data["generated_sql"]
        assert data["query_results"] == mock_results
        assert data["confidence"] == 1.0

    def test_query_coral_execution_failure(self, client, schema_cache):
        mock_coral = _make_mock_coral(
            exc=RuntimeError("Coral binary not found or crashed")
        )
        app.dependency_overrides[get_coral_client] = lambda: mock_coral

        resp = client.post("/query", json={"query": "show github issues"})
        assert resp.status_code == 200
        data = resp.json()

        assert data["query_results"] == []
        assert data["confidence"] == 0.0
        assert "Coral execution failed" in data["answer"]

    def test_query_no_match(self, client, schema_cache):
        mock_coral = _make_mock_coral(results=[])
        app.dependency_overrides[get_coral_client] = lambda: mock_coral

        resp = client.post("/query", json={"query": "xyznonexistent12345"})
        assert resp.status_code == 200
        data = resp.json()

        assert data["generated_sql"] == "SELECT 1"
        assert data["query_results"] == []
        assert data["confidence"] == 0.5
        assert "returned no results" in data["answer"]

    def test_query_requires_query_field(self, client):
        resp = client.post("/query", json={})
        assert resp.status_code == 422

    def test_query_response_structure(self, client, schema_cache):
        mock_coral = _make_mock_coral(results=[{"id": 1}])
        app.dependency_overrides[get_coral_client] = lambda: mock_coral

        resp = client.post("/query", json={"query": "show github issues"})
        data = resp.json()

        assert "generated_sql" in data
        assert "query_results" in data
        assert "answer" in data
        assert "confidence" in data
        assert "evidence" in data
        assert "warnings" in data
