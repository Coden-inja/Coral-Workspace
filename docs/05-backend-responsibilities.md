# Backend Responsibilities

## Purpose

Business logic and platform management. The control plane.

## What It Does

- Authentication and OAuth
- RBAC enforcement
- Workspace management (CRUD, membership)
- User management
- Connector management (credentials, configuration)
- Session management
- Hosted MCP endpoint serving
- Semantic Engine orchestration
- API gateway for Frontend

## What It Does NOT Do

- Does NOT perform LLM inference
- Does NOT run AI models
- Does NOT connect to external systems for data retrieval

## Communication

- Receives requests from Frontend and MCP clients
- Sends natural language queries to Semantic Engine
- Receives structured queries from Semantic Engine
- Forwards structured queries to Coral
- Returns results to callers

## Technology

- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL
- Redis

## Flow Control

```
Request → Backend → Semantic Engine → Coral → External Systems
                                                      │
Result  ← Backend ← Semantic Engine ← Coral ←────────┘
```

Backend orchestrates the full request lifecycle: authentication → authorization → intent parsing → retrieval → response.
