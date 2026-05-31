# CoralTeams Semantic Engine

Natural language intelligence layer for CoralTeams.

## Purpose

The Semantic Engine translates natural language questions into Coral retrieval queries,
executes them through Coral, and produces grounded answers based on retrieved evidence.

## Architecture

```
User Question (NL)
  → Intent Classifier
  → Query Generator
  → Coral Client
  → Evidence Interpreter
  → Grounded Answer
```

## Development

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Configuration

Copy `.env.example` to `.env` and configure:

- Model provider (ollama, openai-compatible)
- Coral connection details
- Service ports

## API

| Method | Path              | Description              |
|--------|-------------------|--------------------------|
| GET    | /health           | Health check             |
| POST   | /query            | Submit a query           |
| POST   | /query/stream     | Submit a query (SSE)     |

## Design Principles

- NOT a RAG system
- NOT a vector database
- NOT an embedding service
- Coral is the retrieval layer — Semantic Engine never replaces it
