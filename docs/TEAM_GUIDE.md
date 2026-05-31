# Team Guide

## Folder Ownership

| Directory         | Owner              | Responsibility                          |
|-------------------|--------------------|-----------------------------------------|
| frontend/         | Frontend Developer | UI, pages, components, state management |
| backend/          | Backend Developer  | APIs, auth, DB logic, Coral orchestration |
| semantic-engine/  | AI Developer       | NL understanding, query gen, evidence grounding |
| infra/            | DevOps             | Docker, deployment, CI/CD, server configs |
| shared/           | All                | Shared types, interfaces, contracts     |
| scripts/          | All                | Utility scripts and setup helpers       |

## Important Rules

- Do NOT push directly to main
- Create your own branch
- Keep contracts/docs updated
- Do NOT change API responses without updating docs/contracts
- Do NOT overengineer phase 1
- Semantic Engine does NOT use vector databases, embeddings, or RAG
- Coral is the retrieval layer — Semantic Engine never replaces it

## Current Stack

| Component      | Technology         |
|----------------|--------------------|
| Frontend       | Next.js, TypeScript |
| Backend        | FastAPI, Python, PostgreSQL |
| Semantic Engine| FastAPI, Python    |
| Infra          | Docker Compose     |

## Development Order

1. Freeze API contracts
2. Freeze DB schema
3. Start independent implementation
4. Integrate services
5. Deploy using Docker Compose

## Documentation Map

| File | Content |
|------|---------|
| docs/01-what-is-coral.md | Coral retrieval engine overview |
| docs/02-what-is-coralteams.md | CoralTeams product vision |
| docs/03-system-architecture.md | Component architecture and communication |
| docs/04-frontend-responsibilities.md | Frontend scope and boundaries |
| docs/05-backend-responsibilities.md | Backend scope and boundaries |
| docs/06-semantic-engine-responsibilities.md | Semantic Engine scope and boundaries |
| docs/07-deployment-architecture.md | Docker stack and infrastructure |
| docs/08-workspace-model.md | Workspace isolation and membership |
| docs/09-rbac-model.md | Role-based access control matrix |
| docs/10-hosted-mcp-model.md | Hosted MCP endpoint design |
| docs/11-agent-mode.md | Agent chat interface design |
| docs/12-connector-architecture.md | Connector lifecycle and types |
| docs/13-future-openclaw-integration.md | Future LLM inference engine |
| docs/architecture/db-schema.md | Database tables and relationships |
| docs/architecture/ports.md | Port allocation table |
| docs/contracts/semantic.md | Backend ↔ Semantic Engine API |
| docs/contracts/query.md | Frontend ↔ Backend query API |
| docs/contracts/auth.md | Authentication API |
| docs/contracts/workspace.md | Workspace CRUD API |
| docs/contracts/connector.md | Connector management API |
