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

---

## 🛠 Deployment Architectures

Because high-performance LLMs and backend hosting can be expensive, this project currently supports two modes of operation: the **Hybrid-Cloud Hack** (for free development) and the **Enterprise Production** (unified deployment).

### 1. The "Hybrid-Cloud Hack" (Current Dev Setup)
This setup allows us to run a full AI-native stack for **$0/month** by leveraging three different cloud providers connected via tunnels.

```text
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│      GOOGLE COLAB       │      │    GITHUB CODESPACES    │      │    VERCEL / RENDER      │
│  (GPU - The Brains)     │      │  (CPU - The Backbone)   │      │   (The Interface)       │
├─────────────────────────┤      ├─────────────────────────┤      ├─────────────────────────┤
│  • Ollama (Qwen 2.5)    │◄────┐│  • Backend (FastAPI)    │◄────┐│  • Frontend (Next.js)   │
│  • Ngrok Tunnel 1       │     ││  • Coral Engine (Rust)  │     ││  • Semantic Engine      │
└─────────────────────────┘     ││  • Postgres & Redis     │     ││    (Public Endpoint)   │
                                ││  • Ngrok Tunnel 2       │     │└─────────────────────────┘
                                │└─────────────────────────┘     │
                                └────────────────────────────────┘
                                     Secure Tunnel Connections
```

*   **Google Colab:** Provides a free T4 GPU to run the LLM (Ollama). It is exposed via an Ngrok tunnel.
*   **GitHub Codespaces:** Serves as our persistent backend. It runs the FastAPI server, the Rust-based Coral engine, and our databases (Postgres/Redis).
*   **Vercel/Render:** Hosts the static frontend and the lightweight semantic orchestration layer.

### 2. Enterprise Production Setup (The "One-Script" Dream)
In a real-world company scenario, everything is deployed on a single high-performance server (or cluster) with dedicated CPU/GPU resources.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ENTERPRISE PRIVATE CLOUD                                 │
│                      (AWS / GCP / AZURE / ON-PREMISE GPU SERVER)                         │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌───────────────────────┐      ┌───────────────────────┐      ┌───────────────────────┐  │
│  │   FRONTEND CONTAINER  │      │   BACKEND CONTAINER   │      │    OLLAMA CONTAINER   │  │
│  │      (Next.js)        │      │      (FastAPI)        │      │      (GPU Accel)      │  │
│  └──────────┬────────────┘      └──────────┬────────────┘      └──────────┬────────────┘  │
│             │                              │                             │                │
│             └──────────────────────────────┼─────────────────────────────┘                │
│                                            │                                              │
│                        ┌───────────────────┴───────────────────┐                          │
│                        │       ORCHESTRATION & STORAGE         │                          │
│                        │  (Postgres, Redis, Coral Engine)      │                          │
│                        └───────────────────────────────────────┘                          │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

*   **Unified Deployment:** A single `docker-compose.yml` or Kubernetes manifest brings up the entire stack.
*   **Low Latency:** No Ngrok tunnels; all communication happens over a high-speed internal virtual network.
*   **Security:** All data stays within the company’s private network boundary.

---

## Features

- **Multi-workspace architecture:** Isolate data and settings across different teams.
- **Team isolation & RBAC:** Secure access control for enterprise environments.
- **Connectors:** Native support for GitHub, Figma, Notion, Slack, and Datadog.
- **Natural Language Queries:** Query your organizational data like you're talking to a teammate.
- **Dual-Stage AI:** NL-to-SQL parsing combined with GPU-powered synthesis.

## Quick Start (Dev Mode)

1.  **Clone the repo:** `git clone <repo-url>`
2.  **Infrastructure:** `docker-compose up -d postgres redis`
3.  **Configure Env:** Use `sync_tunnels.py` to link your Colab and Codespace tunnels.
4.  **Run Backend:** `cd backend && ./venv/bin/uvicorn app.main:app`
5.  **Run Semantic Engine:** `cd semantic-engine && ./venv/bin/uvicorn app.main:app`

---

<p align="center">
  <b>Connect Everything. Query Anything.</b>
</p>

<p align="center">
  CoralTeams © 2026
</p>
