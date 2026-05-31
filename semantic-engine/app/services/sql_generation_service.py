"""LLM-based SQL generation with fallback to rule-based generator.

Tries to generate SQL via ModelProvider. Falls back to the existing
rule-based generator on any failure (model unavailable, empty response,
malformed output, etc.).
"""

from __future__ import annotations

import logging

from app.planner.models import QueryPlan
from app.prompts.sql_generation_prompt import (
    SQL_GENERATION_SYSTEM_PROMPT,
    SQL_GENERATION_USER_PROMPT,
)
from app.providers.base import ModelProvider
from app.schema.schema_cache import SchemaCache
from app.sql.generator import generate as rule_based_generate
from app.sql.models import GeneratedSQL

logger = logging.getLogger(__name__)


def _build_user_prompt(question: str, plan: QueryPlan) -> str:
    context_parts: list[str] = []
    if plan.prompt_context:
        context_parts.append("Schema context:\n")
        context_parts.append(plan.prompt_context)
    if plan.required_filters:
        context_parts.append(
            f"\nRequired filters that MUST be included: {', '.join(plan.required_filters)}"
        )
    context = "\n".join(context_parts)
    return SQL_GENERATION_USER_PROMPT.format(question=question, context=context)


def _extract_sql(raw: str) -> str | None:
    stripped = raw.strip()
    if not stripped:
        return None

    if "```" in stripped:
        lines = stripped.splitlines()
        in_block = False
        cleaned: list[str] = []
        for line in lines:
            if line.startswith("```"):
                in_block = not in_block
                continue
            if in_block:
                cleaned.append(line)
        if cleaned:
            stripped = "\n".join(cleaned).strip()
        else:
            stripped = ""

    return stripped if stripped else None


class SQLGenerationService:
    def __init__(self, schema_cache: SchemaCache) -> None:
        self._schema_cache = schema_cache

    async def generate(
        self,
        question: str,
        plan: QueryPlan,
        model: ModelProvider,
    ) -> GeneratedSQL:
        sql: str | None = None
        used_llm = False

        try:
            user_prompt = _build_user_prompt(question, plan)
            raw = await model.generate_text(
                system=SQL_GENERATION_SYSTEM_PROMPT,
                user=user_prompt,
            )
            extracted = _extract_sql(raw)
            if extracted:
                sql = extracted
                used_llm = True
                logger.info(
                    "LLM SQL generation succeeded for question=%r",
                    question[:60],
                )
            else:
                logger.warning(
                    "LLM returned empty SQL for question=%r; falling back",
                    question[:60],
                )
        except Exception as exc:
            logger.warning(
                "LLM SQL generation failed for question=%r: %s; falling back",
                question[:60],
                exc,
            )

        if sql is None:
            fallback = rule_based_generate(plan, self._schema_cache)
            sql = fallback.sql
            logger.info(
                "Using rule-based fallback for question=%r -> %s",
                question[:60],
                sql[:80],
            )
            return GeneratedSQL(
                sql=sql,
                tables_used=fallback.tables_used,
                required_filters=plan.required_filters,
                warnings=fallback.warnings,
            )

        return GeneratedSQL(
            sql=sql,
            tables_used=plan.candidate_tables + plan.candidate_functions,
            required_filters=plan.required_filters,
            warnings=[] if used_llm else [],
        )
