import json

import httpx

from app.providers.base import ModelProvider


QUERY_PROMPT = """You are a query generator for the Coral retrieval engine.
Given a user question, generate one or more Coral queries to retrieve the relevant data.
Return ONLY a JSON array of query strings, nothing else.

User question: {question}

Coral queries:"""

INTERPRET_PROMPT = """You are a data analyst. Given a user question and the retrieved evidence,
provide a concise, grounded answer using ONLY the evidence provided.
If the evidence does not contain enough information, say so.

User question: {question}

Evidence:
{evidence}

Answer:"""


class OllamaProvider(ModelProvider):

    def __init__(self, base_url: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self._client = httpx.AsyncClient(timeout=60.0)

    async def _generate(self, prompt: str) -> str:
        resp = await self._client.post(
            f"{self.base_url}/api/generate",
            json={"model": self.model, "prompt": prompt, "stream": False},
        )
        resp.raise_for_status()
        return resp.json()["response"]

    async def _stream_generate(self, prompt: str):
        async with self._client.stream(
            "POST",
            f"{self.base_url}/api/generate",
            json={"model": self.model, "prompt": prompt, "stream": True},
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.strip():
                    chunk = json.loads(line)
                    yield chunk.get("response", "")

    async def generate_query(self, question: str) -> list[str]:
        prompt = QUERY_PROMPT.format(question=question)
        raw = await self._generate(prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return [raw.strip()]

    async def interpret(
        self, evidence: list[dict], question: str
    ) -> str:
        prompt = INTERPRET_PROMPT.format(
            question=question,
            evidence=json.dumps(evidence, indent=2),
        )
        return (await self._generate(prompt)).strip()

    async def stream_interpret(
        self, evidence: list[dict], question: str
    ):
        prompt = INTERPRET_PROMPT.format(
            question=question,
            evidence=json.dumps(evidence, indent=2),
        )
        async for token in self._stream_generate(prompt):
            yield token

    async def generate_text(self, system: str, user: str) -> str:
        combined = f"{system}\n\n{user}"
        return (await self._generate(combined)).strip()

    async def ping(self) -> bool:
        try:
            resp = await self._client.get(f"{self.base_url}/api/tags", timeout=5.0)
            return resp.status_code == 200
        except Exception:
            return False
