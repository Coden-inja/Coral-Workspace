from __future__ import annotations

from app.planner.models import RetrievedContext

MAX_COLUMNS_PER_TABLE = 20
MAX_TABLES = 10
MAX_FUNCTIONS = 10


def _format_function_args(func: object) -> str:
    args = getattr(func, "arguments", [])
    parts: list[str] = []
    for arg in args:
        name = getattr(arg, "name", "?")
        required = getattr(arg, "required", False)
        if required:
            parts.append(f"{name}")
        else:
            parts.append(f"[{name}]")
    return ", ".join(parts)


def _format_function(func: object) -> str:
    schema = getattr(func, "schema_name", "")
    name = getattr(func, "function_name", "?")
    args_str = _format_function_args(func)
    desc = getattr(func, "description", "")
    sig = f"{schema}.{name}({args_str})"
    if desc:
        return f"  {sig}  # {desc}"
    return f"  {sig}"


def build_prompt_context(ctx: RetrievedContext) -> str:
    lines: list[str] = []
    tables_shown = 0

    if ctx.tables:
        lines.append("Available tables:")
        lines.append("")
        for table in ctx.tables[:MAX_TABLES]:
            tables_shown += 1
            desc = f" — {table.description}" if table.description else ""
            guide = f"\n    Guide: {table.guide}" if table.guide else ""
            req = (
                f"\n    Required Filters: {table.required_filters}"
                if table.required_filters
                else ""
            )
            lines.append(f"  {table.qualified_name}{desc}{guide}{req}")

            cols = table.columns[:MAX_COLUMNS_PER_TABLE]
            if cols:
                col_parts = []
                for c in cols:
                    col_desc = f" ({c.description})" if c.description else ""
                    col_parts.append(f"{c.column_name}:{c.data_type}{col_desc}")
                col_line = ", ".join(col_parts)
                lines.append(f"    Columns ({len(table.columns)} total, showing {len(cols)}): {col_line}")
                if len(table.columns) > MAX_COLUMNS_PER_TABLE:
                    lines[-1] += " ..."

        lines.append("")

    if ctx.functions:
        lines.append("Available functions:")
        lines.append("")
        for func in ctx.functions[:MAX_FUNCTIONS]:
            lines.append(_format_function(func))
        lines.append("")

    return "\n".join(lines)
