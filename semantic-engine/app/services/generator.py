"""Coral query generation from natural language.

The generator takes a classified intent and produces a set of
Coral retrieval queries. These queries are executed against
Coral to fetch structured evidence.
"""

from app.providers.base import ModelProvider


GENERATOR_PROMPT = """Generate Coral SQL retrieval queries for the following user question.

Available systems: github, gitlab, jira, slack, datadog, sentry

For each system that is relevant, generate a SQL query that Coral would
understand. Coral SQL is a dialect that queries external systems.

User question: {question}
Intent analysis: {intent}

Return ONLY a JSON array of query objects with keys: system, query, purpose"""


async def generate_queries(
    question: str, intent: dict, model: ModelProvider
) -> list[dict]:
    prompt = GENERATOR_PROMPT.format(
        question=question, intent=str(intent)
    )
    raw = await model._generate(prompt)  # type: ignore[attr-defined]
    import json
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return [{"system": "unknown", "query": raw.strip(), "purpose": question}]
