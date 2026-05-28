# Team Guide

## Folder Ownership

frontend/
- Owned by frontend developer
- Contains UI, pages, components, state management

backend/
- Owned by backend developer
- Contains APIs, auth, DB logic, Coral orchestration

semantic-engine/
- Owned by AI developer
- Contains embeddings, semantic matching, ranking

infra/
- Owned by DevOps
- Contains Docker, deployment, CI/CD, server configs

shared/
- Shared common types/interfaces later

scripts/
- Utility scripts and setup helpers

---

## Important Rules

- Do NOT push directly to main
- Create your own branch
- Keep contracts/docs updated
- Do NOT change API responses without updating docs/contracts
- Do NOT overengineer phase 1

---

## Current Stack

Frontend:
- Next.js
- TypeScript

Backend:
- FastAPI
- PostgreSQL

AI:
- Python
- sentence-transformers

Infra:
- Docker Compose

---

## Development Order

1. Freeze API contracts
2. Freeze DB schema
3. Start independent implementation
4. Integrate services
5. Deploy using Docker Compose
