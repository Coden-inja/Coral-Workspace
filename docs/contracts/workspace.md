# Workspace Contract

## Purpose

Defines workspace CRUD APIs and membership handling.

**Owned by:** Backend Team
**Consumed by:** Frontend Team

## Endpoints

### GET /api/workspaces

List workspaces accessible to current user.

### POST /api/workspaces

Create a new workspace.

**Request:**
```json
{
  "name": "string",
  "slug": "string",
  "description": "string (optional)"
}
```

### GET /api/workspaces/{id}

Get workspace details.

### PUT /api/workspaces/{id}

Update workspace.

### DELETE /api/workspaces/{id}

Delete workspace (owner or admin only).

### GET /api/workspaces/{id}/members

List workspace members.

### POST /api/workspaces/{id}/members

Add member to workspace.

**Request:**
```json
{
  "user_id": "uuid",
  "role": "admin | member | viewer"
}
```

### PUT /api/workspaces/{id}/members/{user_id}

Change member role.

### DELETE /api/workspaces/{id}/members/{user_id}

Remove member from workspace.
