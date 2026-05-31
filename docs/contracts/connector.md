# Connector Contract

## Purpose

Defines external connector integrations and credential flow.

**Owned by:** Backend Team
**Consumed by:** Frontend Team

## Endpoints

### GET /api/workspaces/{id}/connectors

List connectors in workspace.

### POST /api/workspaces/{id}/connectors

Create a new connector.

**Request:**
```json
{
  "type": "github | gitlab | jira | slack | datadog | sentry",
  "name": "string",
  "config": {
    "type-specific configuration object"
  }
}
```

### GET /api/workspaces/{id}/connectors/{connector_id}

Get connector details (credentials never returned).

### PUT /api/workspaces/{id}/connectors/{connector_id}

Update connector configuration.

### DELETE /api/workspaces/{id}/connectors/{connector_id}

Delete connector.

### POST /api/workspaces/{id}/connectors/{connector_id}/test

Test connector connection.

### GET /api/connector-types

List available connector types and their configuration schemas.
