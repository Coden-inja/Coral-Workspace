# Connector Architecture

## Overview

Connectors are the bridge between CoralTeams and external systems. Connectors are configured at the workspace level and managed through the CoralTeams Backend.

## Connector Lifecycle

1. **Configure** — Admin provides connection details and credentials for a workspace
2. **Validate** — Backend tests the connection against the external system
3. **Activate** — Connector becomes available for queries
4. **Deactivate** — Connector is disabled without losing configuration
5. **Delete** — Connector and stored credentials are removed

## Credential Management

Credentials are:

- Stored encrypted at rest
- Scoped to a specific workspace
- Never exposed to Frontend or users
- Mutable only through the Backend API

## Connector Types

### Code Repositories
- GitHub (issues, PRs, commits, deployments)
- GitLab (issues, MRs, commits, pipelines)

### Project Management
- Jira (issues, sprints, projects)

### Communication
- Slack (messages, channels, threads)
- Google Workspace (email, calendar, docs)

### Observability
- Datadog (metrics, logs, traces, monitors)
- Sentry (errors, performance)

### Data Stores
- PostgreSQL / MySQL / SQLite
- Files (CSV, JSON, logs)

## Connector Configuration

Each connector type requires different configuration:

```
GitHub:
  - App ID or Personal Access Token
  - Repository list or org scope
  - Webhook secret (optional)

Jira:
  - Base URL
  - API Token or OAuth
  - Project scope

Datadog:
  - API Key
  - Application Key
  - Site (US, EU, etc.)
```

## Connector Status

Each connector has a status:

- `connected` — Working correctly
- `disconnected` — Configuration lost or revoked
- `error` — Authentication failure or API error
- `pending` — Awaiting validation

## Coral Integration

Connectors are defined and managed in the Backend but executed by Coral. The Backend stores connector configuration and credentials. Coral uses them at query time to fetch data from external systems.
