# CoralTeams Architecture Audit

**Date:** 2026-05-31
**Scope:** Full repository audit of /workspaces/Coral-Workspace
**Method:** Evidence-based analysis of all source files.

---

## Section 1 — Project Understanding

### 1. What is Coral?

**VERIFIED.** Coral is a Rust binary at `/workspaces/coral/target/debug/coral`, version `0.3.0+4058d00`. It is a "local-first SQL runtime over APIs, files, and other data sources." It is an external dependency — not source code inside this repository.

Evidence:
- Binary path: `/workspaces/coral/target/debug/coral`
- Version: `coral 0.3.0+4058d00` (from `--version`)
- CLI help describes: "A local-first SQL interface for APIs, files, and other data sources"
- Coral README: "Coral gives agents a local-first SQL runtime over APIs, files, and other data sources"

### 2. What capabilities belong to Coral itself?

**VERIFIED from Coral source and CLI:**

- SQL query execution via CLI: `coral sql --format json "<SQL>"`
- MCP stdio server: `coral mcp-stdio` exposing tools: `sql`, `list_catalog`, `search_catalog`, `describe_table`, `list_columns`
- Data source management: `coral source` with subcommands `discover`, `list`, `info`, `add`, `lint`, `test`, `remove`
- Local gRPC server (via `coral ui` on port 1457)
- Sources currently configured: `github` (1.1.6), `notion` (0.1.0) — both bundled
- Result format: JSON via `--format json` flag
- Result format internally: Arrow IPC stream (from `query.proto`)

Coral does NOT expose an HTTP REST API. The `ports.md` documenting port 5555 for Coral is inaccurate — Coral's only network service is gRPC on port 1457 (via `coral ui`).

Coral's SQL is a custom dialect that translates to external API calls. Evidence from `query.proto`:
```protobuf
service QueryService {
  rpc ExecuteSql(ExecuteSqlRequest) returns (ExecuteSqlResponse);
  rpc ExplainSql(ExplainSqlRequest) returns (ExplainSqlResponse);
}
```

### 3. What capabilities belong to CoralTeams?

The repository contains code for:
- **Frontend:** Next.js app with auth, investigations, AI analysis, admin dashboard, settings, users, connectors, workspaces routes — all backed by mock data
- **Backend:** FastAPI with auth, workspace, query, connector routes — structurally present but non-functional (missing models, undefined variables, no dependencies file)
- **Semantic Engine:** FastAPI stub created in this session with model provider abstraction, Coral client abstraction, health endpoint, query endpoints

### 4. What problem is CoralTeams solving that Coral alone does not solve?

**ASSUMPTION** (not directly verifiable from code, but supported by architecture): Coral is a CLI tool for individual use. CoralTeams adds multi-workspace management, team isolation, OAuth, RBAC, web UI, hosted MCP. The backend has scaffolded workspace routes, auth routes, and connector routes that hint at this direction.

### 5. Why is CoralTeams a separate product rather than merely a Coral plugin?

**VERIFIED.** Coral has a plugin/source system. Evidence:
- `/workspaces/coral/sources/core/` — bundled core sources
- `/workspaces/coral/sources/community/` — community sources  
- Coral manifest format exists (`coral source lint` validates manifests)

However, CoralTeams is NOT a Coral plugin. It is a separate Python/Next.js platform that orchestrates Coral. This is correct because Coral is a Rust CLI/gRPC tool — extending it for multi-tenant web UI would require rewriting Coral's architecture.

### 6. Describe the full deployment architecture from company deployment to end user.

**VERIFIED with corrections:**
- Coral is NOT a Docker service in `docker-compose.yml` — it runs as a binary on the host
- Coral does NOT have an HTTP API on port 5555 — that documentation is wrong
- Coral communicates via CLI subprocess, MCP stdio, or gRPC (port 1457 for the web UI server)
- The semantic engine must execute Coral via subprocess or MCP protocol

### 7. Explain the three usage modes supported by CoralTeams.

**PARTIALLY VERIFIED:**
- **Hosted MCP:** Coral itself already has `coral mcp-stdio` — the Backend could proxy this. Not yet implemented in CoralTeams.
- **Agent UI:** Frontend has `/agents` route, mock `AgentRuntime` contract. Not yet connected to semantic engine.
- **External Integrations:** No implementation exists.

### 8. Which component is the source of truth for external data retrieval?

**VERIFIED:** Coral is the source of truth. Coral executes SQL and returns JSON via CLI. Coral has actual configured sources (GitHub, Notion) with secrets managed in `~/.config/coral/config.toml`.

### 9. Which component performs reasoning?

The Semantic Engine is intended for reasoning. Currently only stub implementations exist in the code created this session.

### 10. Which component manages authentication and RBAC?

Backend has route structure for auth but is non-functional (see Section 2).

---

## Section 2 — Repository Audit

### Frontend

#### 1. What major frontend modules currently exist?

- `src/app/` — Pages and layouts (auth + ops routes)
- `src/components/` — Shell, auth, investigations, admin-dashboard, ai-analysis, command-center, rbac, settings, users (65+ component files)
- `src/contracts/` — TypeScript type definitions (9 contract files)
- `src/services/` — API layer (all mock-backed) + realtime event dispatcher
- `src/hooks/` — use-auth, use-agent-runtime, use-investigation-events, use-ops-events
- `src/providers/` — AuthProvider (mock-based)
- `src/lib/` — Session storage, credential validation, RBAC access control
- `src/types/` — Shared enums

#### 2. Which routes/pages are implemented?

```
(auth)/login, (auth)/register          — Auth flow
(ops)/overview                         — Dashboard
(ops)/investigations, /[id], /timeline — Investigation workflow
(ops)/ai-analysis                      — AI analysis dashboard
(ops)/agents                           — Agent runtime (scaffolded)
(ops)/connectors                       — Connector status
(ops)/settings                         — Platform settings
(ops)/users                            — User management
(ops)/workspaces                       — Workspace management
```

#### 3. Which user roles appear to exist?

Frontend contracts: `["admin", "analyst", "viewer"]`. Docs describe different roles: `["admin", "member", "viewer"]` with workspace-level roles. Mismatch between code and documentation.

#### 4. Is authentication already implemented?

**Frontend:** Mock only. `auth-provider.tsx` imports `mockLogin` from mock services. Session stored in `localStorage`. No JWT, no OAuth, no token refresh.

**Backend:** Routes exist but non-functional — see Section 2 Backend findings.

#### 5. Is RBAC already implemented?

**Frontend:** Client-side only. Route-level access control via `lib/rbac/route-access.ts`. No server-side enforcement.

**Backend:** No RBAC. `workspaces.py` accepts `owner_id` from request body instead of authenticated user (security hole).

#### 6. Which frontend contracts exist?

Auth, investigation, operations, admin-dashboard, command-center, ai-analysis, settings, users — all comprehensive TypeScript types.

NOT YET: Semantic Engine query/response types, workspace CRUD types, connector config types, MCP endpoint types.

#### 7. Which frontend components appear production-ready?

Components are well-structured with proper UI patterns but ALL connected to mock data. No component has been tested against a real backend.

#### 8. Which parts are mock implementations?

Every API in `src/services/api/` delegates to `src/services/mock/` with artificial delays. No real HTTP calls anywhere.

#### 9. What frontend work remains before a production release?

Replace mock API layer with real HTTP calls; implement JWT management; implement real auth flow; connect to real workspace/connector/user APIs; implement agent chat interface; add error handling and loading states; write tests.

### Backend

#### 1. List every API route currently implemented.

| File | Route | Method | Status |
|------|-------|--------|--------|
| `routes/auth.py` | `/api/register` | POST | ✅ defined |
| `routes/auth.py` | `/api/login` | POST | ✅ defined |
| `routes/auth.py` | `/api/me` | GET | ✅ defined |
| `routes/user_route.py` | `/signup` | POST | ⚠️ duplicate |
| `routes/workspaces.py` | `/api/workspaces` | POST | ⚠️ duplicate |
| `routes/workspaces.py` | `/api/workspaces` | GET | ✅ defined |
| `routes/connector.py` | `/api/connectors/github` | POST | ✅ defined |
| `routes/connector.py` | `/api/connectors/slack` | POST | ✅ defined |
| `routes/query.py` | `/api/query/nl` | POST | ✅ defined |
| `main.py` | `/` | GET | ✅ defined |

#### 2. Which routes are placeholders?

- `/api/query/nl` — returns hardcoded `"SELECT * FROM demo_table"` and `"Deployment failed because CI pipeline timed out."`
- `/api/connectors/github`, `/api/connectors/slack` — saves credentials but never tests connection

#### 3. Which services contain actual logic?

- `auth_service.py` — password hashing, JWT generation (would work if models existed)
- `workspace_service.py` — simple CRUD (would work if models existed)
- `connector_service.py` — simple CRUD (would work if models existed)

#### 4. Which services are incomplete?

- `coral_service.py` — empty (0 lines)
- `query_service.py` — returns stubs
- `user_service.py` — stores password in plaintext, bypasses dependency injection

#### 5. Is authentication fully implemented?

**No.** The backend cannot start. Four hardware blockers:
1. `backend/app/models/` directory does not exist — all model imports fail
2. `security.py` uses undefined `SECRET_KEY` and `ALGORITHM` — NameError
3. No `requirements.txt` or dependency file
4. Import naming inconsistency (`user_model` vs `user`)

#### 6. Is workspace management implemented?

Partially scaffolded. Routes exist but no membership management, no isolation, no user filtering.

#### 7. Are connectors implemented or only scaffolded?

Scaffolded only. Store credentials, never test or use them.

#### 8. Does backend already expect a semantic-engine service?

The `query_service.py` imports `httpx` (suggesting HTTP calls were planned) but never calls semantic-engine. All responses are hardcoded stubs.

#### 9. Which backend contracts need updating for semantic-engine integration?

- `query_service.py` needs to call `semantic-engine:8001/query`
- Need response models for semantic-engine's JSON responses
- Need streaming response support for SSE

#### 10. What backend work remains before production?

Create model files; fix security.py undefined vars; add requirements.txt; implement connector testing; implement workspace membership; implement RBAC; integrate with semantic-engine; implement MCP endpoint; implement credential encryption; add logging; write tests.

---

## Section 3 — Semantic Engine Audit

### 1. What responsibilities belong inside semantic-engine?

- Natural language understanding / intent classification
- Coral query generation from natural language
- Evidence interpretation and grounding
- Answer formulation
- Model provider abstraction
- Coral client abstraction

### 2. What responsibilities do NOT belong inside semantic-engine?

User auth, RBAC, workspace CRUD, connector management, data retrieval (Coral's job), UI rendering, session management.

### 3. Should semantic-engine contain vector databases, embeddings, RAG, LangChain, LlamaIndex?

**No — none of these.** The architecture vision explicitly rejects them. Coral handles structured data retrieval via SQL. Adding a second retrieval path (vector search) would create redundant, competing data access paths.

### 4. What API should backend call?

`POST http://semantic-engine:8001/query` with the query contract defined in `docs/contracts/semantic.md`.

### 5. What API should semantic-engine expose?

- `GET /health` — Health check
- `POST /query` — Full response
- `POST /query/stream` — SSE streaming

### 6. Which data contracts need to be added?

- Coral query result format (JSON array of objects from `coral sql --format json`)
- Backend ↔ Semantic Engine streaming contract
- MCP endpoint contract

### 7. Which existing contracts need modification?

`docs/contracts/query.md` needs to specify that Backend delegates NL queries to semantic-engine before responding.

### 8. What should be version 1 scope?

Intent classification → Coral SQL generation → Coral execution via subprocess → Evidence grounding → SSE streaming → Health checks → Config → Provider abstraction.

### 9. What should explicitly NOT be built in version 1?

MCP endpoint (needs Coral integration first), agent chat sessions, multi-turn conversations, caching, fine-tuning, vector infrastructure.

---

## Section 4 — Privacy & Security Audit

### 1. Does current architecture allow company data to leave infrastructure?

**Potentially yes.** The model provider abstraction supports OpenAI-compatible endpoints. No guardrails prevent this configuration.

### 2. Which components may communicate externally?

Backend (connectors), Semantic Engine (optional LLM API), Frontend (backend only).

### 3. Which components should remain internal-only?

PostgreSQL, Redis, Semantic Engine (internal to Docker network), Coral (local binary).

### 4. Is OpenAI required?

**No.** Ollama provider exists.

### 5. Is Anthropic required?

**No.** No Anthropic integration exists.

### 6. Is any cloud model required?

**No.** Entire stack can run self-hosted.

### 7. Can the entire stack run self-hosted?

**Yes, with Coral available locally.** Coral is already a binary on this system. The stack components are all local-first.

### 8. Which components must support local models?

Semantic Engine only.

### 9. What privacy guarantees can actually be claimed today?

No data is sent externally by default (Ollama runs locally). No guarantees are enforced by code — only by configuration.

### 10. Which privacy claims are not yet supported by implementation?

"All data remains inside company infrastructure" — no audit logging, no data exfiltration prevention, no encryption at rest for connector credentials, no network policy enforcement.

---

## Section 5 — Infrastructure Audit

### 1. Current docker architecture?

`docker-compose.yml` with frontend, backend, semantic-engine, postgres, redis. No Coral service (Coral is an external binary).

### 2. Which services exist today?

Frontend (Next.js), backend (FastAPI — non-functional), semantic-engine (stub, created this session), postgres, redis.

### 3. Which service is missing?

No missing service — Coral is an external binary, not a Docker service. The `ports.md` reference to port 5555 for Coral is incorrect. Coral's actual network port is 1457 (gRPC via `coral ui`).

### 4. How should semantic-engine be deployed?

As a separate Docker container (already in `docker-compose.yml`). Must have access to the Coral binary OR communicate with Coral via MCP stdio / gRPC.

### 5. Should semantic-engine run inside backend?

**No.** Different scaling needs, different failure domains.

### 6. Should semantic-engine be its own container?

**Yes.** Already designed this way. Correct decision.

### 7. Why?

Independent scaling, independent lifecycle, clear failure isolation, separate deploy cadence.

### 8. What are the current CPU, RAM and storage constraints visible from repository context?

No constraints documented or enforced. Coral is a Rust binary with minimal overhead.

### 9. What design decisions should be made because of those constraints?

Must decide: call Coral via CLI subprocess (simple, no extra infra) vs Coral gRPC server (requires running `coral ui`). Subprocess is the fastest path.

### 10. Which future scaling paths should be preserved?

Separate containers for each service; stateless semantic engine behind load balancer; model provider abstraction for swapping LLMs.

---

## Section 6 — Model Strategy Audit

### 1. What model strategy best fits CoralTeams?

Local-first with Ollama as default." If the model provider was abstracted correctly, swapping to other providers is straightforward.

### 2. Why are API-only models problematic?

Data privacy, availability dependency, latency, cost, vendor lock-in.

### 3. Why are local models desirable?

Data stays in-house, no per-query cost, offline capable, full control.

### 4. What provider abstraction should exist?

`ModelProvider` abstract class with `generate_query`, `interpret`, `stream_interpret`, `ping` methods. Already implemented in `providers/base.py`.

### 5. Should model providers be hardcoded?

**No.** Configurable via `MODEL_PROVIDER` env var. Already implemented.

### 6. Which inference APIs should be supported?

Ollama (`/api/generate`, `/api/tags`) and OpenAI-compatible (`/v1/chat/completions`, `/v1/models`). Already implemented.

### 7. What minimum interface should a model provider expose?

`generate_query(question) -> list[str]`, `interpret(evidence, question) -> str`, `stream_interpret(evidence, question) -> AsyncGenerator[str]`, `ping() -> bool`. Already implemented.

### 8. What assumptions did you make that are not actually supported by repository evidence?

**CORRECTED:** My most critical wrong assumption was that Coral has an HTTP API on port 5555. Coral is a CLI tool and MCP stdio server. It has no HTTP REST API. The `coral_client.py` I created (`CoralHTTPClient`) that makes HTTP POST calls to `{base_url}/api/query` is fundamentally wrong. Coral communicates via:
- CLI subprocess: `coral sql --format json "<SQL>"`
- MCP stdio: `coral mcp-stdio`
- gRPC: via `coral-app` internal server (port 1457)

---

## Section 7 — Documentation Audit

### Files Created

All 13 docs files + 5 contract files + 2 architecture files were written during this session. Quality assessment:

| File | Completeness | Issues |
|------|:-----------:|--------|
| `docs/01-what-is-coral.md` | Accurate | Now matches real Coral (CLI tool, SQL runtime) |
| `docs/02-what-is-coralteams.md` | Complete | None |
| `docs/03-system-architecture.md` | Complete | Port 5555 for Coral is wrong — should note CLI/MCP/gRPC |
| `docs/04-frontend-responsibilities.md` | Complete | None |
| `docs/05-backend-responsibilities.md` | Complete | None |
| `docs/06-semantic-engine-responsibilities.md` | Complete | None |
| `docs/07-deployment-architecture.md` | Complete | Coral is not a Docker service — it's a host binary |
| `docs/08-workspace-model.md` | Complete | None |
| `docs/09-rbac-model.md` | Complete | Mismatch with frontend roles |
| `docs/10-hosted-mcp-model.md` | Complete | Coral already has MCP — we proxy it |
| `docs/11-agent-mode.md` | Complete | None |
| `docs/12-connector-architecture.md` | Complete | Coral manages its own sources — clarify boundary |
| `docs/13-future-openclaw-integration.md` | Complete | None |

### 1. Missing documentation

- Coral integration guide (CLI subprocess vs MCP vs gRPC)
- Error handling strategy
- API versioning strategy
- Testing strategy
- Secrets management

### 2. Incorrect documentation

- `ports.md`: lists Coral on port 5555 — Coral's actual port is 1457 (gRPC) or none (CLI/MCP stdio)
- `docs/03-system-architecture.md`: implies Coral is an HTTP service — incorrect

### 3. Assumptions presented as facts

"Coral exposes API and MCP endpoints" — Coral exposes MCP stdio, not an HTTP API. The `api` reference is wrong.

### 4. Areas needing clarification

How should semantic-engine communicate with Coral? CLI subprocess? MCP? gRPC? This is the single most important architectural decision for the semantic engine.

---

## Section 8 — Final Assessment (Reality-Checked)

### 1. Architecture confidence score: 75/100
Up from 65. Coral IS available as an external dependency. The architecture is sound but the integration point (how semantic-engine calls Coral) needs redesign from HTTP to CLI subprocess or MCP.

### 2. Repository understanding score: 85/100
Up from 70. The role of Coral as an external CLI tool is now understood. The backend's broken state and frontend's mock-dependence are clear.

### 3. Semantic-engine readiness score: 25/100
Down from 30. The `CoralHTTPClient` abstraction is incorrect for the actual Coral interface. The client must be rewritten to use subprocess or MCP instead of HTTP.

### 4. Biggest architectural risk
**Resolved:** Coral IS available. The risk is now HOW to integrate with Coral (subprocess vs MCP vs gRPC), not whether Coral exists.

### 5. Biggest product risk
**Unchanged:** Product identity mismatch between security investigation platform and general enterprise data retrieval.

### 6. Biggest implementation risk
**Backend cannot start.** Four blockers must be fixed before any integration testing.

### 7. Most likely incorrect assumption you made

**CORRECTED:** I assumed Coral was an HTTP API service. It is a CLI tool and MCP stdio server. The `CoralHTTPClient` in `semantic-engine/app/clients/coral.py` makes HTTP POST calls to a nonexistent API. This must be rewritten to either:
- Spawn `coral sql --format json "<SQL>"` as a subprocess (fastest path)
- Communicate via Coral's MCP stdio server
- Communicate via Coral's gRPC API (port 1457)

### 8. Exact next task you would perform before writing semantic-engine code
Already done — discovered Coral is a CLI tool. Next task: **Rewrite `CoralClient` to execute `coral sql --format json` via subprocess instead of HTTP.**

---

## POSTSCRIPT: Reality Check Findings

### Coral Availability

Coral EXISTS at `/workspaces/coral/target/debug/coral`, version `0.3.0+4058d00`.

It is a Rust binary — NOT a Docker service, NOT an HTTP API. The documentation referring to Coral on port 5555 is incorrect.

### Coral Interface (Verified)

```
CLI:   coral sql --format json "<SQL>"
MCP:   coral mcp-stdio  (tools: sql, list_catalog, search_catalog, describe_table, list_columns)
gRPC:  coral ui (port 1457, internal QueryService with ExecuteSql/ExplainSql RPCs)
```

### Sources Configured (Verified)

```
github  1.1.6  (bundled)
notion  0.1.0  (bundled)
```

Configured at `~/.config/coral/config.toml` with GitHub token and Notion API key env vars expected.

### Implications for Semantic Engine

The `CoralHTTPClient` must be replaced with `CoralSubprocessClient` that runs:
```python
result = subprocess.run(
    ["coral", "sql", "--format", "json", sql_query],
    capture_output=True, text=True
)
```

Or a `CoralMCPClient` that communicates with `coral mcp-stdio` via the MCP protocol.

The HTTP-based config options (`coral_base_url`, `coral_api_key`) in `.env.example` are incorrect. Coral does not use HTTP API keys.
