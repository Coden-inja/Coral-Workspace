# Query Contract

## Purpose

Defines query execution APIs between Frontend and Backend.

**Owned by:** Backend Team
**Consumed by:** Frontend + MCP

## Endpoints

### POST /api/query

Submit a natural language query.

**Request:**
```json
{
  "query": "string",
  "workspace_id": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "pending | running | completed | failed",
  "answer": "string | null",
  "created_at": "timestamp"
}
```

### GET /api/query/{id}

Get query result.

### GET /api/query/{id}/stream

Stream query response tokens.

### GET /api/queries

List recent queries for a workspace.

**Query Params:**
- workspace_id (required)
- limit (default: 20)
- offset (default: 0)
