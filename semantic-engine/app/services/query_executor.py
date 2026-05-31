"""Query execution orchestrator.

Takes a natural-language question through the full pipeline:
Planner → SQL Generation (LLM with rule-based fallback) → SQL Validator → Coral execution → Answer generation.
"""

from __future__ import annotations

from typing import Any

from app.clients.base import CoralClient
from app.planner.planner import QueryPlanner
from app.providers.base import ModelProvider
from app.schema.schema_cache import SchemaCache
from app.services.sql_generation_service import SQLGenerationService
from app.sql.generator import generate as rule_based_generate_sql
from app.sql.validator import validate as validate_sql
from app.models.query import QueryExecuteResponse


def _build_answer(
    question: str,
    sql: str,
    results: list[dict[str, Any]],
) -> str:
    if not results:
        return (
            f"The query returned no results.\n\n"
            f"**Generated SQL:**\n```sql\n{sql}\n```\n"
            f"**Rows returned:** 0"
        )

    row_count = len(results)
    cols = list(results[0].keys()) if results else []

    lines: list[str] = []
    lines.append(f"**Rows returned:** {row_count}")
    lines.append(f"**Columns:** {', '.join(cols)}")
    lines.append("")

    preview_count = min(row_count, 5)
    lines.append(f"**First {preview_count} record(s):**")
    for i, row in enumerate(results[:preview_count], start=1):
        parts = [f"**{k}:** {v}" for k, v in row.items()]
        lines.append(f"  {i}. {', '.join(parts)}")

    lines.append("")
    lines.append(
        f"The query executed successfully and returned {row_count} row(s)."
    )
    return "\n".join(lines)


class QueryExecutor:
    def __init__(
        self,
        schema_cache: SchemaCache,
        coral_client: CoralClient,
        model_provider: ModelProvider | None = None,
    ) -> None:
        self._schema_cache = schema_cache
        self._coral_client = coral_client
        self._model_provider = model_provider
        self._planner = QueryPlanner(schema_cache=schema_cache)
        self._sql_gen_service = SQLGenerationService(schema_cache=schema_cache)

    async def execute(
        self,
        question: str,
    ) -> QueryExecuteResponse:
        plan = self._planner.create_plan(question)

        if self._model_provider is not None:
            generated = await self._sql_gen_service.generate(
                question=question,
                plan=plan,
                model=self._model_provider,
            )
        else:
            generated = rule_based_generate_sql(plan, self._schema_cache)

        validation = validate_sql(
            generated.sql,
            self._schema_cache,
            required_filters=generated.required_filters,
        )

        if not validation.valid:
            return QueryExecuteResponse(
                generated_sql=generated.sql,
                query_results=[],
                answer=f"SQL validation failed: {'; '.join(validation.errors)}",
                confidence=0.0,
                evidence=[{"type": "validation_error", "errors": validation.errors}],
                warnings=generated.warnings + validation.errors,
            )

        try:
            results = await self._coral_client.execute_sql(generated.sql)
        except RuntimeError as exc:
            return QueryExecuteResponse(
                generated_sql=generated.sql,
                query_results=[],
                answer=f"Coral execution failed: {exc}",
                confidence=0.0,
                evidence=[{"type": "execution_error", "error": str(exc)}],
                warnings=generated.warnings + [str(exc)],
            )

        answer = _build_answer(question, generated.sql, results)

        return QueryExecuteResponse(
            generated_sql=generated.sql,
            query_results=results,
            answer=answer,
            confidence=1.0 if results else 0.5,
            evidence=[
                {
                    "type": "sql_result",
                    "row_count": len(results),
                    "columns": list(results[0].keys()) if results else [],
                }
            ],
            warnings=generated.warnings,
        )
