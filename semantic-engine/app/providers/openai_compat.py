import json

import httpx

from app.providers.base import ModelProvider


QUERY_SYSTEM_PROMPT = """You are a query generator for the Coral retrieval engine.
Given a user question, generate one or more Coral queries to retrieve the relevant data.
Return ONLY a JSON array of query strings, nothing else."""

INTERPRET_SYSTEM_PROMPT = """You are a data analyst. Given a user question and the retrieved evidence,
provide a concise, grounded answer using ONLY the evidence provided.
If the evidence does not contain enough information, say so."""


class OpenAICompatProvider(ModelProvider):

    def __init__(self, base_url: str, model: str, api_key: str = ""):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.api_key = api_key
        self._client = httpx.AsyncClient(timeout=60.0)

    async def _chat(self, system: str, user: str) -> str:
        resp = await self._client.post(
            f"{self.base_url}/v1/chat/completions",
            json={
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            },
            headers=self._headers(),
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

    async def _stream_chat(self, system: str, user: str):
        async with self._client.stream(
            "POST",
            f"{self.base_url}/v1/chat/completions",
            json={
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "stream": True,
            },
            headers=self._headers(),
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    payload = line[6:].strip()
                    if payload == "[DONE]":
                        break
                    chunk = json.loads(payload)
                    token = chunk["choices"][0]["delta"].get("content", "")
                    if token:
                        yield token

    def _headers(self) -> dict:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def generate_query(self, question: str) -> list[str]:
        raw = await self._chat(QUERY_SYSTEM_PROMPT, question)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return [raw.strip()]

    async def interpret(
        self, evidence: list[dict], question: str
    ) -> str:
        content = json.dumps(evidence, indent=2)
        user = f"Evidence:\n{content}\n\nQuestion: {question}"
        return (await self._chat(INTERPRET_SYSTEM_PROMPT, user)).strip()

    async def stream_interpret(
        self, evidence: list[dict], question: str
    ):
        content = json.dumps(evidence, indent=2)
        user = f"Evidence:\n{content}\n\nQuestion: {question}"
        async for token in self._stream_chat(INTERPRET_SYSTEM_PROMPT, user):
            yield token

    async def generate_text(self, system: str, user: str) -> str:
        return (await self._chat(system, user)).strip()

    async def ping(self) -> bool:
        try:
            resp = await self._client.get(
                f"{self.base_url}/v1/models", headers=self._headers(), timeout=5.0
            )
            return resp.status_code == 200
        except Exception:
            return False
