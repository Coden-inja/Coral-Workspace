# Deployment Architecture

## Docker Stack

The entire platform runs as a single Docker Compose deployment.

```
docker-compose.yml
├── frontend       (Next.js, port 3000)
├── backend        (FastAPI, port 8000)
├── semantic-engine (FastAPI, port 8001)
├── postgres       (PostgreSQL 16, port 5432)
├── redis          (Redis 7, port 6379)
└── coral          (Coral retrieval engine, port 5555)
```

## Infrastructure Requirements

### Minimum

- 4 CPU cores
- 8 GB RAM
- 50 GB disk
- Docker and Docker Compose

### Recommended

- 8 CPU cores
- 16 GB RAM
- 100 GB SSD
- Docker and Docker Compose
- Reverse proxy (nginx, Caddy, Traefik)

## Deployment Targets

- AWS (EC2, ECS, EKS)
- Azure (VM, AKS)
- GCP (Compute Engine, GKE)
- Bare metal
- Private cloud / on-premise

## Network Layout

```
Internet
  │
  ▼
Reverse Proxy (port 443)
  │
  ├── / → Frontend (port 3000)
  ├── /api → Backend (port 8000)
  ├── /mcp → Backend MCP endpoint (port 8000)
  └── /ws → Backend WebSocket (port 8000)
```

## Security

- All internal service communication is isolated to Docker network
- Database is not exposed externally
- Redis is not exposed externally
- Reverse proxy terminates TLS
- OAuth2 / JWT for API authentication
