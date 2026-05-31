from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from app.planner.models import QueryPlan
from app.providers.base import ModelProvider
from app.services.sql_generation_service import (
    SQLGenerationService,
    _build_user_prompt,
    _extract_sql,
)


class TestExtractSQL:
    def test_plain_sql(self):
        assert _extract_sql("SELECT * FROM t LIMIT 20") == "SELECT * FROM t LIMIT 20"

    def test_with_backtick_fences(self):
        raw = "```sql\nSELECT * FROM t\n```"
        assert _extract_sql(raw) == "SELECT * FROM t"

    def test_with_plain_fences(self):
        raw = "```\nSELECT 1\n```"
        assert _extract_sql(raw) == "SELECT 1"

    def test_multiline_fenced(self):
        raw = "```\nSELECT *\nFROM t\nLIMIT 20\n```"
        assert _extract_sql(raw) == "SELECT *\nFROM t\nLIMIT 20"

    def test_empty_string(self):
        assert _extract_sql("") is None

    def test_whitespace_only(self):
        assert _extract_sql("   \n  ") is None

    def test_strips_surrounding_text(self):
        raw = "Here is your SQL:\n```sql\nSELECT 1\n```\nHope that helps!"
        assert _extract_sql(raw) == "SELECT 1"

    def test_no_backticks_but_has_text(self):
        raw = "SELECT *\nFROM t\nLIMIT 20"
        assert _extract_sql(raw) == "SELECT *\nFROM t\nLIMIT 20"


class TestBuildUserPrompt:
    def test_with_context_and_filters(self):
        plan = QueryPlan(
            user_question="show issues",
            candidate_tables=["github.issues"],
            required_filters=["owner", "repo"],
            prompt_context="Available tables:\n  github.issues",
        )
        prompt = _build_user_prompt("show issues", plan)
        assert "show issues" in prompt
        assert "github.issues" in prompt
        assert "owner" in prompt
        assert "repo" in prompt

    def test_no_filters(self):
        plan = QueryPlan(
            user_question="list pages",
            prompt_context="Available tables:\n  notion.pages",
        )
        prompt = _build_user_prompt("list pages", plan)
        assert "notion.pages" in prompt
        assert "Required filters" not in prompt

    def test_no_context(self):
        plan = QueryPlan(
            user_question="hello",
        )
        prompt = _build_user_prompt("hello", plan)
        assert prompt == "User question: hello\n\n\n\nGenerate the SQL:"


class TestSQLGenerationService:
    @pytest.mark.asyncio
    async def test_successful_generation(self, schema_cache):
        model = AsyncMock(spec=ModelProvider)
        model.generate_text.return_value = "SELECT * FROM github.issues LIMIT 20"
        service = SQLGenerationService(schema_cache=schema_cache)

        plan = QueryPlan(
            user_question="show issues",
            candidate_tables=["github.issues"],
            prompt_context="Available tables:\n  github.issues",
        )
        result = await service.generate("show issues", plan, model)

        assert result.sql == "SELECT * FROM github.issues LIMIT 20"
        assert "github.issues" in result.tables_used
        model.generate_text.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_empty_llm_response_falls_back(self, schema_cache):
        model = AsyncMock(spec=ModelProvider)
        model.generate_text.return_value = ""
        service = SQLGenerationService(schema_cache=schema_cache)

        plan = QueryPlan(
            user_question="show issues",
            candidate_tables=["github.issues"],
            required_filters=[],
            prompt_context="Available tables:\n  github.issues",
        )
        result = await service.generate("show issues", plan, model)

        assert "FROM github.issues" in result.sql
        assert "LIMIT 20" in result.sql

    @pytest.mark.asyncio
    async def test_llm_failure_falls_back(self, schema_cache):
        model = AsyncMock(spec=ModelProvider)
        model.generate_text.side_effect = RuntimeError("Model unavailable")
        service = SQLGenerationService(schema_cache=schema_cache)

        plan = QueryPlan(
            user_question="show issues",
            candidate_tables=["github.issues"],
            prompt_context="Available tables:\n  github.issues",
        )
        result = await service.generate("show issues", plan, model)

        assert "FROM github.issues" in result.sql
        assert "LIMIT 20" in result.sql

    @pytest.mark.asyncio
    async def test_whitespace_response_falls_back(self, schema_cache):
        model = AsyncMock(spec=ModelProvider)
        model.generate_text.return_value = "   \n  \n"
        service = SQLGenerationService(schema_cache=schema_cache)

        plan = QueryPlan(
            user_question="show issues",
            candidate_tables=["github.issues"],
            prompt_context="Available tables:\n  github.issues",
        )
        result = await service.generate("show issues", plan, model)

        assert "FROM github.issues" in result.sql

    @pytest.mark.asyncio
    async def test_no_match_falls_back(self, schema_cache):
        model = AsyncMock(spec=ModelProvider)
        model.generate_text.side_effect = RuntimeError("Model unavailable")
        service = SQLGenerationService(schema_cache=schema_cache)

        plan = QueryPlan(
            user_question="xyznonexistent",
            prompt_context="",
        )
        result = await service.generate("xyznonexistent", plan, model)

        assert result.sql == "SELECT 1"
        assert len(result.warnings) > 0

    @pytest.mark.asyncio
    async def test_function_path_via_llm(self, schema_cache):
        model = AsyncMock(spec=ModelProvider)
        model.generate_text.return_value = (
            "SELECT * FROM github.search_issues(q => 'auth') LIMIT 20"
        )
        service = SQLGenerationService(schema_cache=schema_cache)

        plan = QueryPlan(
            user_question="search auth issues",
            candidate_functions=["github.search_issues"],
            candidate_tables=["github.issues"],
            prompt_context="Available functions:\n  github.search_issues(q)",
        )
        result = await service.generate("search auth issues", plan, model)

        assert "github.search_issues" in result.sql
        assert "q => 'auth'" in result.sql
