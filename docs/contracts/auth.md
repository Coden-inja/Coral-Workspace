# Auth Contract

## Purpose

Defines authentication APIs, JWT flow, and session handling.

**Owned by:** Backend Team
**Consumed by:** Frontend Team

## Base URL

```
http://localhost:8000
```

## Endpoints

### POST /api/signup

Create a new user account.

**Request:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "global_role": "member",
  "created_at": "timestamp"
}
```

### POST /api/login

Authenticate and receive JWT token.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string (JWT)",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "global_role": "string"
  }
}
```

### POST /api/logout

Invalidate current session.

### GET /api/me

Get current user profile and workspace memberships.

### POST /api/refresh

Refresh JWT token.

**Response:** Same as login.
