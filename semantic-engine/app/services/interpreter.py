"""Intent classification and context assembly.

The interpreter determines what kind of query the user needs
and what systems are relevant. This is the first step in the
query pipeline: raw natural language → classified intent.
"""

from app.providers.base import ModelProvider


INTENT_PROMPT = """Analyze the user's question and determine:
1. What type of data they need
2. Which systems might contain this data (github, jira, slack, datadog, sentry, etc.)
3. Any time constraints or filters

User question: {question}

Return a concise intent analysis as a JSON object with keys:
intent_type, target_systems, time_range, filters"""


async def classify_intent(
    question: str, model: ModelProvider
) -> dict:
    prompt = INTENT_PROMPT.format(question=question)
    raw = await model._generate(prompt)  # type: ignore[attr-defined]
    import json
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "intent_type": "unknown",
            "target_systems": [],
            "time_range": None,
            "filters": {},
        }
