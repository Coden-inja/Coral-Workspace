from __future__ import annotations

import json
from typing import Any

from pydantic import BaseModel, field_validator


class ColumnMetadata(BaseModel):
    schema_name: str
    table_name: str
    ordinal_position: int
    column_name: str
    data_type: str
    is_nullable: bool = True
    is_virtual: bool = False
    is_required_filter: bool = False
    description: str = ""
    filter_mode: str | None = None

    @field_validator("is_nullable", "is_virtual", "is_required_filter", mode="before")
    @classmethod
    def coerce_bool(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes")
        return bool(v)


class TableMetadata(BaseModel):
    schema_name: str
    table_name: str
    description: str = ""
    guide: str = ""
    required_filters: str = ""
    search_limits_json: str | None = None
    columns: list[ColumnMetadata] = []

    @property
    def qualified_name(self) -> str:
        return f"{self.schema_name}.{self.table_name}"

    @property
    def required_filter_list(self) -> list[str]:
        if not self.required_filters:
            return []
        return [f.strip() for f in self.required_filters.split(",") if f.strip()]


class FilterMetadata(BaseModel):
    schema_name: str
    table_name: str
    filter_name: str
    filter_mode: str
    is_required: bool = False
    data_type: str = "Utf8"
    description: str = ""

    @field_validator("is_required", mode="before")
    @classmethod
    def coerce_bool(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes")
        return bool(v)


class FunctionArgument(BaseModel):
    name: str
    required: bool = False
    values: list[str] = []

    @field_validator("required", mode="before")
    @classmethod
    def coerce_bool(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes")
        return bool(v)


class ResultColumn(BaseModel):
    name: str
    type: str = "Utf8"
    nullable: bool = True
    description: str = ""

    @field_validator("nullable", mode="before")
    @classmethod
    def coerce_bool(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes")
        return bool(v)


class TableFunctionMetadata(BaseModel):
    schema_name: str
    function_name: str
    description: str = ""
    arguments: list[FunctionArgument] = []
    result_columns: list[ResultColumn] = []
    kind: str = "table"
    search_limits_json: str | None = None

    @field_validator("arguments", "result_columns", mode="before")
    @classmethod
    def parse_json_fields(cls, v: Any, info: Any) -> Any:
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, TypeError):
                pass
        return v if v is not None else []

    @property
    def qualified_name(self) -> str:
        return f"{self.schema_name}.{self.function_name}"


class SchemaCatalog(BaseModel):
    tables: dict[str, TableMetadata] = {}
    filters: dict[str, list[FilterMetadata]] = {}
    functions: dict[str, TableFunctionMetadata] = {}

    def add_table(self, table: TableMetadata) -> None:
        self.tables[table.qualified_name] = table

    def add_filter(self, filter_: FilterMetadata) -> None:
        key = f"{filter_.schema_name}.{filter_.table_name}"
        if key not in self.filters:
            self.filters[key] = []
        self.filters[key].append(filter_)

    def add_function(self, func: TableFunctionMetadata) -> None:
        self.functions[func.qualified_name] = func

    def get_table(self, schema: str, table: str) -> TableMetadata | None:
        return self.tables.get(f"{schema}.{table}")

    def get_columns(self, schema: str, table: str) -> list[ColumnMetadata]:
        t = self.get_table(schema, table)
        return t.columns if t else []

    def get_filters(self, schema: str, table: str) -> list[FilterMetadata]:
        return self.filters.get(f"{schema}.{table}", [])

    def get_required_filters(self, schema: str, table: str) -> list[FilterMetadata]:
        return [f for f in self.get_filters(schema, table) if f.is_required]

    def get_functions(self, schema: str) -> list[TableFunctionMetadata]:
        prefix = f"{schema}."
        return [v for k, v in self.functions.items() if k.startswith(prefix)]

    def search_tables(self, text: str) -> list[TableMetadata]:
        text_lower = text.lower()
        results: list[TableMetadata] = []
        for table in self.tables.values():
            if (
                text_lower in table.table_name.lower()
                or text_lower in table.description.lower()
            ):
                results.append(table)
        return results

    def search_functions(self, text: str) -> list[TableFunctionMetadata]:
        text_lower = text.lower()
        results: list[TableFunctionMetadata] = []
        for func in self.functions.values():
            if (
                text_lower in func.function_name.lower()
                or text_lower in func.description.lower()
            ):
                results.append(func)
        return results
