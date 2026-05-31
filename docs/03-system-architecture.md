# System Architecture

## Overview

CoralTeams consists of four major components:

```
┌─────────────┐
│   Frontend  │  Next.js, TypeScript — Admin & user UI
├─────────────┤
│   Backend   │  FastAPI, Python — Business logic & control plane
├─────────────┤
│  Semantic   │  FastAPI, Python — Natural language intelligence
│   Engine    │
├─────────────┤
│   Coral     │  Open-source retrieval engine — Data access
└─────────────┘
```

Supporting infrastructure:

- PostgreSQL — Primary database
- Redis — Caching, session management, pub/sub

## Component Boundaries

```
User
 │
 ▼
┌─────────────┐
│   Frontend  │  Port 3000
├─────────────┤
│   Backend   │  Port 8000
├─────────────┤
│  Semantic   │  Port 8001
│   Engine    │
├─────────────┤
│   Coral     │  Port 5555
└─────────────┘
 │
 ▼
External Systems
(GitHub, Jira, Slack, Datadog, etc.)
```

## Communication Flow

### Hosted MCP Mode

```
Claude/Cursor/IDE
  → Hosted MCP Endpoint (Backend)
  → Coral
  → External Systems
  → Answer
```

### Agent UI Mode

```
Browser
  → Frontend
  → Backend
  → Semantic Engine
  → Coral
  → External Systems
  → Answer
```

### External Integration Mode

```
Slack/Teams/Discord
  → Backend (via webhook/API)
  → Semantic Engine
  → Coral
  → External Systems
  → Answer
```

## Isolation

Each component runs in its own container. Components communicate over HTTP. Backend is the only component that talks to the database directly. Frontend only talks to Backend.
