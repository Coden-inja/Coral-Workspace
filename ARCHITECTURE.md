# CoralOps Architecture

## Routing

- `frontend/src/app/(ops)/layout.tsx` provides the persistent operational shell.
- Core routes:
  - `/overview`
  - `/investigations`
  - `/investigations/[id]`
  - `/investigations/[id]/timeline`
  - `/agents`
  - `/connectors`
  - `/workspaces`
- Root path (`/`) redirects to `/overview`.

## State Flow

- Local UI state stays in page and feature components.
- Investigation workflow state is isolated in `InvestigationStoreProvider` and only mounted on timeline routes.
- Feature hooks (`use-agent-runtime`, `use-ops-events`, `use-investigation-events`) coordinate async and live updates without leaking state globally.

## Event Flow

1. `services/mock/events.ts` generates mock websocket event payloads.
2. `services/realtime/ops-events.ts` dispatches events through a subscription abstraction.
3. Feature hooks subscribe to the realtime layer.
4. Components update UI state from typed `WebsocketOpsEvent` messages.

## Realtime Architecture

- Public realtime API: `subscribeToOpsEvents(callback, intervalMs?)`.
- Internal implementation uses a dispatcher with:
  - centralized listener registry
  - interval lifecycle management
  - unsubscribe cleanup when no listeners remain
- This shape mirrors a future websocket client and avoids component coupling to mock implementations.

## Contracts and Services

- `frontend/src/contracts/` is the source of truth for typed domain contracts.
- `frontend/src/types/common.ts` contains shared enums/unions for severity, statuses, tones, connector states, and event categories.
- `frontend/src/services/api/` exposes Promise-based API functions used by pages/hooks:
  - `getInvestigations`
  - `getInvestigationById`
  - `getTimeline`
  - `getRecentAlerts`
  - `getConnectorStatus`
  - `getAgentRuntime`
- `frontend/src/services/mock/` contains mock generators and fixtures split by concern:
  - investigations
  - telemetry
  - graph
  - event simulation
  - operations

## Backend Integration Points

- Replace internals of `services/api/*` with real HTTP/SDK calls while preserving function signatures.
- Keep contract types stable to reduce UI churn.
- Use `services/realtime/*` as the single websocket/SSE integration boundary.
- Add auth/session headers at the API layer, not inside components.

## AI Integration Points

- Agent runtime surfaces (`AgentRuntime`) are already contract-driven and can be backed by real model orchestration telemetry.
- Timeline AI reasoning (`AiReasoningStep`) and evidence fields (`aiReasoningSummary`) are isolated in contracts, enabling direct model-output mapping.
- Toast and ops event contracts can accept new AI event categories without UI architectural changes.
