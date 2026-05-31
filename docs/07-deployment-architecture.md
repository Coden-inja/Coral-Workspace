# Deployment Architecture

CoralTeams supports two deployment models: **Enterprise Production** (Unified Stack) and **Hybrid-Cloud Dev** (Distributed Tunnels).

## 1. Enterprise Production (Target)

The entire platform runs as a single Docker Compose deployment on a high-performance server.

### Docker Stack

```
docker-compose.yml
├── frontend        (Next.js, port 3000)
├── backend         (FastAPI, port 8000)
├── semantic-engine (FastAPI, port 8001)
├── ollama-service  (LLM, port 11434, GPU Accel)
├── postgres        (PostgreSQL 16, port 5432)
├── redis           (Redis 7, port 6379)
└── coral           (Rust retrieval engine)
```

### Infrastructure Requirements

- **CPU:** 8+ Cores
- **RAM:** 16 GB+
- **GPU:** NVIDIA (8GB+ VRAM recommended for Ollama)
- **OS:** Linux (Ubuntu 22.04+ recommended)

---

## 2. Hybrid-Cloud Dev (Current Hack)

To enable zero-cost development with high-performance AI, we utilize a distributed architecture connected via secure tunnels.

### Topology

1.  **Google Colab (The Brains):** Runs the heavy LLM (Ollama) on a free T4 GPU. Exposed via Ngrok.
2.  **GitHub Codespaces (The Backbone):** Runs the Backend, Databases, and the Rust Coral Engine.
3.  **Vercel/Render (The Edge):** Hosts the public-facing UI and semantic orchestration.

### Connectivity Map

- **Frontend → Backend:** Via Ngrok Tunnel A (`*.ngrok-free.app`)
- **Semantic Engine → Ollama:** Via Ngrok Tunnel B (`*.ngrok-free.dev`)
- **Backend → Semantic Engine:** Via Direct VPC (Render Internal)

---

## Network Layout (Enterprise)

```
Internet
  │
  ▼
Reverse Proxy (port 443)
  │
  ├── / → Frontend (port 3000)
  ├── /api → Backend (port 8000)
  └── /ws → Backend WebSocket (port 8000)
```

## Security

- **Isolation:** Internal services (DB, Redis, Semantic Engine) are not exposed externally.
- **Tunnels:** Development tunnels use authtokens and (optional) basic auth.
- **Auth:** All endpoints require JWT tokens issued by the Backend.
