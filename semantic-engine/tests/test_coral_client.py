from __future__ import annotations

import json
import subprocess
from unittest.mock import patch

import pytest

from app.clients.coral_client import CoralSubprocessClient, execute_sql


class TestExecuteSql:
    def test_successful_query(self):
        expected = [{"id": 1, "name": "test"}]
        mock_result = type(
            "Result",
            (),
            {"returncode": 0, "stdout": json.dumps(expected), "stderr": ""},
        )()
        with patch("subprocess.run", return_value=mock_result):
            result = execute_sql("SELECT 1 AS id, 'test' AS name", "coral")
            assert result == expected

    def test_empty_output(self):
        mock_result = type(
            "Result", (), {"returncode": 0, "stdout": "", "stderr": ""}
        )()
        with patch("subprocess.run", return_value=mock_result):
            result = execute_sql("SELECT 1", "coral")
            assert result == []

    def test_single_dict_output(self):
        mock_result = type(
            "Result",
            (),
            {"returncode": 0, "stdout": json.dumps({"id": 1}), "stderr": ""},
        )()
        with patch("subprocess.run", return_value=mock_result):
            result = execute_sql("SELECT 1", "coral")
            assert result == [{"id": 1}]

    def test_nonzero_exit(self):
        mock_result = type(
            "Result",
            (),
            {
                "returncode": 1,
                "stdout": "",
                "stderr": "Error: table not found",
            },
        )()
        with patch("subprocess.run", return_value=mock_result):
            with pytest.raises(RuntimeError, match="Coral SQL error"):
                execute_sql("SELECT bad", "coral")

    def test_invalid_json(self):
        mock_result = type(
            "Result",
            (),
            {"returncode": 0, "stdout": "not json", "stderr": ""},
        )()
        with patch("subprocess.run", return_value=mock_result):
            with pytest.raises(RuntimeError, match="Failed to parse"):
                execute_sql("SELECT 1", "coral")

    def test_timeout_raises(self):
        with patch("subprocess.run", side_effect=subprocess.TimeoutExpired("coral", 30)):
            with pytest.raises(subprocess.TimeoutExpired):
                execute_sql("SELECT 1", "coral")


class TestCoralSubprocessClient:
    @pytest.mark.asyncio
    async def test_execute(self):
        expected = [{"ok": 1}]
        mock_result = type(
            "Result",
            (),
            {"returncode": 0, "stdout": json.dumps(expected), "stderr": ""},
        )()
        with patch("subprocess.run", return_value=mock_result):
            client = CoralSubprocessClient(coral_binary="coral")
            result = await client.execute("SELECT 1 AS ok", "default")
            assert "data" in result
            assert result["data"] == expected
            assert result["workspace_id"] == "default"

    @pytest.mark.asyncio
    async def test_execute_sql(self):
        expected = [{"id": 1}]
        mock_result = type(
            "Result",
            (),
            {"returncode": 0, "stdout": json.dumps(expected), "stderr": ""},
        )()
        with patch("subprocess.run", return_value=mock_result):
            client = CoralSubprocessClient(coral_binary="coral")
            result = await client.execute_sql("SELECT 1 AS id")
            assert result == expected

    @pytest.mark.asyncio
    async def test_ping_success(self):
        mock_result = type(
            "Result",
            (),
            {"returncode": 0, "stdout": '[{"ok":1}]', "stderr": ""},
        )()
        with patch("subprocess.run", return_value=mock_result):
            client = CoralSubprocessClient(coral_binary="coral")
            assert await client.ping() is True

    @pytest.mark.asyncio
    async def test_ping_failure(self):
        mock_result = type(
            "Result",
            (),
            {"returncode": 1, "stdout": "", "stderr": "error"},
        )()
        with patch("subprocess.run", return_value=mock_result):
            client = CoralSubprocessClient(coral_binary="coral")
            assert await client.ping() is False
