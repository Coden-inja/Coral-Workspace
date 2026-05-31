<p align="center">
  <img src="./assets/banner.png" alt="CoralTeams Banner" width="100%">
</p>

<h1 align="center">CoralTeams</h1>

<p align="center">
  Self-hosted workspace intelligence powered by Coral.
</p>

## Overview

CoralTeams unifies organizational tools into a single searchable workspace.

Connect GitHub, Jira, Slack, Docs, Datadog, internal systems, and more to enable natural language search, semantic retrieval, and AI-powered workflows.

## Features

- Multi-workspace architecture
- Team isolation & RBAC
- GitHub, Jira, Slack & Datadog connectors
- Custom YAML connectors
- Semantic search
- Natural language queries
- AI agent integration
- Self-hosted deployment

## Example Queries

```text
Which deployments failed this week?

Who has unresolved high-priority tickets?

Summarize customer issues reported this month.

Which employees have more than 10 pending tasks?
```


## Architecture

```text
GitHub • Jira • Slack • Docs • Internal Tools
                     │
                CoralTeams
                     │
       Semantic Layer + Workspace Engine
                     │
             AI Agents & Users
```


## CoralTeams

### Services

```text
frontend
backend
semantic-engine
postgres
redis
```

### Ports

| Service | Port |
|----------|------|
| Frontend | 3000 |
| Backend | 8000 |
| Semantic Engine | 8001 |
| PostgreSQL | 5432 |
| Redis | 6379 |


## Tech Stack

| Layer | Technologies |
|---------|-------------|
| Frontend | Next.js, TypeScript |
| Backend | FastAPI, PostgreSQL, Redis |
| AI | Coral, Sentence Transformers |
| Infra | Docker, Docker Compose, AWS |


## Quick Start

```bash
git clone <repo-url>
cd CoralTeams
docker compose up -d
```

## Vision

A unified intelligence layer that makes organizational knowledge accessible to both humans and AI agents.


<p align="center">
  <b>Connect Everything. Query Anything.</b>
</p>

<p align="center">
  CoralTeams © 2026
</p>
