from __future__ import annotations

from pydantic import BaseModel

from app.schema.schema_models import (
    ColumnMetadata,
    FilterMetadata,
    TableFunctionMetadata,
    TableMetadata,
)


class RetrievedContext(BaseModel):
    tables: list[TableMetadata] = []
    columns: list[ColumnMetadata] = []
    filters: list[FilterMetadata] = []
    functions: list[TableFunctionMetadata] = []


class QueryPlan(BaseModel):
    user_question: str
    candidate_tables: list[str] = []
    candidate_functions: list[str] = []
    required_filters: list[str] = []
    prompt_context: str = ""
