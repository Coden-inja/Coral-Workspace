from __future__ import annotations

import logging
import threading

from app.schema.schema_loader import load_schema
from app.schema.schema_models import (
    ColumnMetadata,
    FilterMetadata,
    SchemaCatalog,
    TableFunctionMetadata,
    TableMetadata,
)

logger = logging.getLogger(__name__)


class SchemaCache:
    _instance: SchemaCache | None = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        self._catalog: SchemaCatalog | None = None
        self._coral_binary: str = "coral"
        self._loaded = False

    @classmethod
    def get_instance(cls) -> SchemaCache:
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        with cls._lock:
            cls._instance = None

    def configure(self, coral_binary: str = "coral") -> None:
        self._coral_binary = coral_binary

    def load(self) -> SchemaCatalog:
        logger.info("Loading schema catalog from Coral...")
        catalog = load_schema(coral_binary=self._coral_binary)
        with self._lock:
            self._catalog = catalog
            self._loaded = True
        logger.info(
            "Schema cache loaded: %d tables, %d filters, %d functions",
            len(catalog.tables),
            len(catalog.filters),
            len(catalog.functions),
        )
        return catalog

    def reload(self) -> SchemaCatalog:
        self._loaded = False
        return self.load()

    @property
    def catalog(self) -> SchemaCatalog:
        if not self._loaded or self._catalog is None:
            return self.load()
        return self._catalog

    @property
    def tables(self) -> dict[str, TableMetadata]:
        return self.catalog.tables

    @property
    def filters(self) -> dict[str, list[FilterMetadata]]:
        return self.catalog.filters

    @property
    def functions(self) -> dict[str, TableFunctionMetadata]:
        return self.catalog.functions

    def get_table(self, schema: str, table: str) -> TableMetadata | None:
        return self.catalog.get_table(schema, table)

    def get_columns(self, schema: str, table: str) -> list[ColumnMetadata]:
        return self.catalog.get_columns(schema, table)

    def get_filters(self, schema: str, table: str) -> list[FilterMetadata]:
        return self.catalog.get_filters(schema, table)

    def get_required_filters(self, schema: str, table: str) -> list[FilterMetadata]:
        return self.catalog.get_required_filters(schema, table)

    def get_functions(self, schema: str) -> list[TableFunctionMetadata]:
        return self.catalog.get_functions(schema)

    def search_tables(self, text: str) -> list[TableMetadata]:
        return self.catalog.search_tables(text)

    def search_functions(self, text: str) -> list[TableFunctionMetadata]:
        return self.catalog.search_functions(text)

    def format_schema_context(
        self, schema: str, table: str, include_columns: bool = True
    ) -> str:
        lines: list[str] = []
        tbl = self.get_table(schema, table)
        if not tbl:
            return f"Table {schema}.{table} not found."

        lines.append(f"## {tbl.qualified_name}")
        if tbl.description:
            lines.append(f"Description: {tbl.description}")
        if tbl.guide:
            lines.append(f"Usage Guide: {tbl.guide}")
        if tbl.required_filters:
            lines.append(f"Required Filters: {tbl.required_filters}")

        if include_columns and tbl.columns:
            lines.append("\n### Columns")
            for col in tbl.columns:
                nullable = "NULL" if col.is_nullable else "NOT NULL"
                desc = f" — {col.description}" if col.description else ""
                lines.append(f"- {col.column_name} ({col.data_type}, {nullable}){desc}")

        req_filters = self.get_required_filters(schema, table)
        if req_filters:
            lines.append("\n### Required Filter Constraints")
            for f in req_filters:
                lines.append(f"- {f.filter_name} ({f.filter_mode}, {f.data_type})")

        return "\n".join(lines)

    def format_schema_context_for_prompt(
        self, table_names: list[str], max_cols_per_table: int = 20
    ) -> str:
        sections: list[str] = []
        for qualified in table_names:
            if "." not in qualified:
                continue
            schema, table = qualified.split(".", 1)
            tbl = self.get_table(schema, table)
            if not tbl:
                continue

            desc = f" — {tbl.description}" if tbl.description else ""
            guide = f"\n  Guide: {tbl.guide}" if tbl.guide else ""
            req = f"\n  Required Filters: {tbl.required_filters}" if tbl.required_filters else ""
            section = f"  - {qualified}{desc}{guide}{req}"

            cols = tbl.columns[:max_cols_per_table]
            if cols:
                col_lines = ", ".join(f"{c.column_name}:{c.data_type}" for c in cols)
                section += f"\n    Columns ({len(tbl.columns)} total, showing {len(cols)}): {col_lines}"
                if len(tbl.columns) > max_cols_per_table:
                    section += " ..."

            sections.append(section)

        return "\n".join(sections)
