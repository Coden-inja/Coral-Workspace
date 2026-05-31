# Semantic Engine Responsibilities

## Purpose

Natural language intelligence layer.

## What It Does

- Understand user questions (intent classification)
- Generate Coral retrieval requests from natural language
- Execute Coral retrieval via Coral client
- Interpret and ground answers on retrieved evidence
- Return structured investigation answers

## What It Is NOT

- NOT a vector search system
- NOT a RAG platform
- NOT a document embedding service
- NOT a semantic memory system
- NOT a replacement for Coral

## Design Principles

- Coral already retrieves structured data
- The model only needs to:
  1. Understand intent
  2. Generate retrieval requests
  3. Interpret retrieved evidence
  4. Produce answers

## Architecture

```
User Question (NL)
  → Intent Classifier
  → Query Generator
  → Coral Client
  → Evidence Interpreter
  → Grounded Answer
```

## Abstraction Layers

### Model Provider

Abstracts LLM inference behind a common interface. Supports:

- Ollama
- OpenAI-compatible endpoints
- Local inference servers
- Future OpenClaw integration

### Coral Client

Abstracts Coral interaction behind a common interface. Supports:

- Coral SQL API
- Coral HTTP API
- Coral MCP
