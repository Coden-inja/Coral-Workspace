# Hosted MCP Model

## Purpose

Allow developers to connect Claude Desktop, Cursor, VS Code, or any MCP-compatible client to Coral through CoralTeams without installing or configuring Coral locally.

## Target Users

- Developers
- Engineers
- Analysts

## Flow

```
Claude / Cursor / IDE
  → MCP Client
  → CoralTeams MCP Endpoint (Backend)
  → Coral
  → GitHub + Datadog + Sentry (or other connectors)
  → Answer
```

## Authentication

Users authenticate once via OAuth. The MCP endpoint validates the session token and scopes access to the user's workspace.

## Configuration

Users configure their MCP client with a single endpoint URL:

```json
{
  "mcpServers": {
    "coral": {
      "url": "https://coral.company.com/mcp",
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  }
}
```

No local Coral installation. No connector configuration. No credential management.

## Workspace Scoping

The MCP endpoint automatically scopes all queries to the user's default workspace. Users with multiple workspaces can specify a workspace header.

## Example Interaction

User asks: "Why did deployment fail?"

Behind the scenes:
1. MCP endpoint receives the query
2. Backend authenticates the user
3. Semantic Engine processes the natural language query
4. Coral retrieves data from GitHub (deployment status), Datadog (metrics), Sentry (errors)
5. Evidence is grounded and returned as an answer

## Benefits

- Zero local setup
- Centralized credential management
- Workspace-level access control
- Audit logging for all queries
- No data leaves company infrastructure
