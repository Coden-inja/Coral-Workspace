# Future OpenClaw Integration

## What Is OpenClaw

OpenClaw is a local-first LLM inference engine designed for enterprise self-hosted deployments. It provides OpenAI-compatible API endpoints for running models locally.

## Why OpenClaw

CoralTeams needs a local LLM for:

- Intent classification
- Query generation
- Evidence interpretation
- Answer formulation

Using external LLM APIs would violate the "no data leaves company infrastructure" principle.

## Integration Point

```
Semantic Engine
  → Model Provider Abstraction
  → OpenClaw (or Ollama, or OpenAI-compatible endpoint)
```

## Model Provider Abstraction

The Semantic Engine already uses a model provider abstraction. This abstraction allows swapping between:

- OpenClaw (future)
- Ollama (local)
- OpenAI API (external, optional)
- Any OpenAI-compatible endpoint

Switching between providers requires only a configuration change:

```yaml
model:
  provider: openclaw       # or: ollama, openai
  base_url: http://openclaw:8080
  model: coral-7b
```

## OpenClaw Benefits

- Fully self-hosted
- No external API calls
- Data never leaves the network
- GPU-accelerated when available
- CPU fallback when GPU is not available
- OpenAI API compatible (drop-in replacement)

## Timeline

OpenClaw integration is planned for a future phase. The Semantic Engine's model provider abstraction is designed to support it from day one.
