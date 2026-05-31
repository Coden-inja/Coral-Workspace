"""Evidence grounding and answer formulation.

The grounding layer takes raw evidence from Coral and produces
a grounded answer. It ensures the answer is supported by the
retrieved data and does not hallucinate.
"""

import json

from app.providers.base import ModelProvider


GROUNDING_PROMPT = """You are a precise data analyst answering questions based ONLY on the 
evidence provided. Follow these rules strictly:

1. ONLY use information present in the evidence
2. If evidence is insufficient, state what is missing
3. Cite specific data points from the evidence
4. Do not speculate or add external knowledge
5. Be concise and direct

User question: {question}

Evidence:
{evidence}

Provide a grounded answer:"""


async def ground_answer(
    question: str, evidence: list[dict], model: ModelProvider
) -> str:
    prompt = GROUNDING_PROMPT.format(
        question=question,
        evidence=json.dumps(evidence, indent=2),
    )
    return (await model._generate(prompt)).strip()  # type: ignore[attr-defined]


async def stream_grounded_answer(
    question: str, evidence: list[dict], model: ModelProvider
):
    prompt = GROUNDING_PROMPT.format(
        question=question,
        evidence=json.dumps(evidence, indent=2),
    )
    async for token in model._stream_generate(prompt):  # type: ignore[attr-defined]
        yield token
