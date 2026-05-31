from __future__ import annotations

import asyncio
import json
import subprocess
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from app.clients.base import CoralClient

_thread_pool: ThreadPoolExecutor | None = None


def _get_pool() -> ThreadPoolExecutor:
    global _thread_pool
    if _thread_pool is None:
        _thread_pool = ThreadPoolExecutor(max_workers=4)
    return _thread_pool


def execute_sql(sql: str, coral_binary: str = "coral") -> list[dict[str, Any]]:
    result = subprocess.run(
        [coral_binary, "sql", sql, "--format", "json"],
        capture_output=True,
        text=True,
        timeout=60,
    )
    if result.returncode != 0:
        stderr = result.stderr.strip()
        raise RuntimeError(f"Coral SQL error (exit {result.returncode}): {stderr}")
    if not result.stdout.strip():
        return []
    try:
        parsed = json.loads(result.stdout)
        if isinstance(parsed, list):
            return parsed
        if isinstance(parsed, dict):
            return [parsed]
        return []
    except json.JSONDecodeError as e:
        raise RuntimeError(
            f"Failed to parse Coral JSON output: {e}\nRaw: {result.stdout[:500]}"
        ) from e


class CoralSubprocessClient(CoralClient):
    def __init__(self, coral_binary: str = "coral"):
        self.coral_binary = coral_binary

    async def execute(self, query: str, workspace_id: str = "default") -> dict[str, Any]:
        results = await asyncio.get_event_loop().run_in_executor(
            _get_pool(), self._sync_execute, query
        )
        return {"data": results, "workspace_id": workspace_id}

    async def execute_sql(self, sql: str) -> list[dict[str, Any]]:
        return await asyncio.get_event_loop().run_in_executor(
            _get_pool(), self._sync_execute, sql
        )

    async def ping(self) -> bool:
        try:
            await asyncio.get_event_loop().run_in_executor(
                _get_pool(),
                execute_sql,
                "SELECT 1 AS ok",
                self.coral_binary,
            )
            return True
        except Exception:
            return False

    def _sync_execute(self, sql: str) -> list[dict[str, Any]]:
        return execute_sql(sql, self.coral_binary)
