from __future__ import annotations

from app.planner.models import QueryPlan, RetrievedContext
from app.planner.prompt_builder import build_prompt_context
from app.planner.retriever import retrieve
from app.schema.schema_cache import SchemaCache
from app.sql.generator import generate as generate_sql
from app.sql.models import GeneratedSQL
from app.sql.validator import validate as validate_sql


def _collect_required_filters(ctx: RetrievedContext) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for filt in ctx.filters:
        if filt.is_required and filt.filter_name not in seen:
            seen.add(filt.filter_name)
            result.append(filt.filter_name)
    return result


class QueryPlanner:
    def __init__(self, schema_cache: SchemaCache) -> None:
        self._schema_cache = schema_cache

    def create_plan(
        self,
        question: str,
        max_tables: int = 10,
        max_columns: int = 20,
    ) -> QueryPlan:
        context = retrieve(
            question,
            self._schema_cache,
            max_tables=max_tables,
            max_columns=max_columns,
        )

        prompt_context = build_prompt_context(context)

        candidate_tables = [t.qualified_name for t in context.tables]
        candidate_functions = [f.qualified_name for f in context.functions]
        required_filters = _collect_required_filters(context)

        return QueryPlan(
            user_question=question,
            candidate_tables=candidate_tables,
            candidate_functions=candidate_functions,
            required_filters=required_filters,
            prompt_context=prompt_context,
        )

    def generate_sql(
        self,
        question: str,
        max_tables: int = 10,
        max_columns: int = 20,
    ) -> GeneratedSQL:
        plan = self.create_plan(
            question,
            max_tables=max_tables,
            max_columns=max_columns,
        )
        return generate_sql(plan, self._schema_cache)

    def generate_and_validate(
        self,
        question: str,
        max_tables: int = 10,
        max_columns: int = 20,
    ) -> tuple[GeneratedSQL, object]:
        generated = self.generate_sql(
            question,
            max_tables=max_tables,
            max_columns=max_columns,
        )
        validation = validate_sql(
            generated.sql,
            self._schema_cache,
            required_filters=generated.required_filters,
        )
        return generated, validation
