# Semantic Contract

## Purpose

Defines the API contract between Backend and Semantic Engine.

**Owned by:** AI Team
**Consumed by:** Backend Team

## Base URL

```
http://semantic-engine:8001
```

## Endpoints

### POST /query

Submit a natural language query.

**Request:**
```json
{
  "query": "string — natural language question",
  "workspace_id": "uuid — scoping workspace",
  "user_id": "uuid — requesting user",
  "session_id": "uuid — conversation session (optional)"
}
```

**Response:**
```json
{
  "answer": "string — natural language answer",
  "evidence": [
    {
      "source": "string — connector type",
      "data": "object — retrieved data"
    }
  ],
  "coral_queries": ["string — generated Coral queries"],
  "confidence": "float — 0.0 to 1.0"
}
```

### POST /query/stream

Submit a natural language query with streaming response.

**Request:** Same as POST /query

**Response:** Server-Sent Events stream with tokens.

### GET /health

Health check.

**Response:**
```json
{
  "status": "ok",
  "model": "string — active model name",
  "coral": "connected | disconnected"
}
```

## Error Format

```json
{
  "error": "string — error code",
  "message": "string — human-readable message",
  "detail": "object — optional debug info"
}
```
