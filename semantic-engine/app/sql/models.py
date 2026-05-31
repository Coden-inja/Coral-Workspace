from __future__ import annotations

from pydantic import BaseModel


class GeneratedSQL(BaseModel):
    sql: str
    tables_used: list[str] = []
    required_filters: list[str] = []
    warnings: list[str] = []


class SQLValidationResult(BaseModel):
    valid: bool
    errors: list[str] = []
