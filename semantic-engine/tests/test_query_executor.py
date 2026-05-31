from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from app.clients.base import CoralClient
from app.services.query_executor import QueryExecutor, _build_answer


class TestBuildAnswer:
    def test_with_results(self):
        results = [
            {"id": 1, "title": "Fix bug", "state": "open"},
            {"id": 2, "title": "Add test", "state": "closed"},
        ]
        answer = _build_answer("show issues", "SELECT * FROM issues", results)
        assert "**Rows returned:** 2" in answer
        assert "Fix bug" in answer
        assert "Add test" in answer

    def test_empty_results(self):
        answer = _build_answer("show issues", "SELECT * FROM issues", [])
        assert "returned no results" in answer
        assert "**Rows returned:** 0" in answer
        assert "SELECT * FROM issues" in answer

    def test_single_row(self):
        results = [{"name": "test"}]
        answer = _build_answer("show", "SELECT 1", results)
        assert "**Rows returned:** 1" in answer
        assert "**First 1 record" in answer

    def test_truncates_preview_at_five(self):
        results = [{"id": i} for i in range(10)]
        answer = _build_answer("q", "SELECT", results)
        assert "**Rows returned:** 10" in answer
        assert "**First 5 record" in answer
        assert "6." not in answer


class TestQueryExecutor:
    @pytest.mark.asyncio
    async def test_validation_failure_path(self, schema_cache):
        coral = AsyncMock(spec=CoralClient)
        executor = QueryExecutor(schema_cache=schema_cache, coral_client=coral)

        with patch(
            "app.services.query_executor.validate_sql",
            return_value=type("V", (), {"valid": False, "errors": ["Forbidden statement"]})(),
        ):
            result = await executor.execute("show issues")
            assert result.confidence == 0.0
            assert "SQL validation failed" in result.answer
            assert "Forbidden statement" in result.answer
            assert result.query_results == []
            coral.execute_sql.assert_not_called()

    @pytest.mark.asyncio
    async def test_execution_failure_path(self, schema_cache):
        coral = AsyncMock(spec=CoralClient)
        coral.execute_sql.side_effect = RuntimeError("Connection refused")
        executor = QueryExecutor(schema_cache=schema_cache, coral_client=coral)

        result = await executor.execute("show issues")
        assert result.confidence == 0.0
        assert "Coral execution failed" in result.answer
        assert result.query_results == []

    @pytest.mark.asyncio
    async def test_success_path(self, schema_cache):
        coral = AsyncMock(spec=CoralClient)
        coral.execute_sql.return_value = [{"id": 1, "title": "Test"}]
        executor = QueryExecutor(schema_cache=schema_cache, coral_client=coral)

        result = await executor.execute("show issues")
        assert result.confidence == 1.0
        assert result.query_results == [{"id": 1, "title": "Test"}]
        assert "**Rows returned:** 1" in result.answer

    @pytest.mark.asyncio
    async def test_empty_result_path(self, schema_cache):
        coral = AsyncMock(spec=CoralClient)
        coral.execute_sql.return_value = []
        executor = QueryExecutor(schema_cache=schema_cache, coral_client=coral)

        result = await executor.execute("show issues")
        assert result.confidence == 0.5
        assert result.query_results == []
        assert "returned no results" in result.answer
