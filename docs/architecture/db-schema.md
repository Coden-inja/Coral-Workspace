# Database Schema

## Overview

PostgreSQL 16 serves as the primary database. The schema is owned by the Backend service. No other service writes to the database directly.

## Core Tables

### users
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- name (VARCHAR)
- global_role (ENUM: admin, member)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### workspaces
- id (UUID, PK)
- name (VARCHAR)
- slug (VARCHAR, UNIQUE)
- description (TEXT)
- owner_id (UUID, FK → users)
- status (ENUM: active, inactive, archived)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### workspace_members
- id (UUID, PK)
- workspace_id (UUID, FK → workspaces)
- user_id (UUID, FK → users)
- role (ENUM: owner, admin, member, viewer)
- created_at (TIMESTAMP)

### connectors
- id (UUID, PK)
- workspace_id (UUID, FK → workspaces)
- type (VARCHAR)
- name (VARCHAR)
- config (JSONB, encrypted)
- status (ENUM: connected, disconnected, error, pending)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### queries
- id (UUID, PK)
- workspace_id (UUID, FK → workspaces)
- user_id (UUID, FK → users)
- natural_language (TEXT)
- coral_query (TEXT, nullable)
- result (JSONB, nullable)
- status (ENUM: pending, running, completed, failed)
- created_at (TIMESTAMP)

### sessions
- id (UUID, PK)
- user_id (UUID, FK → users)
- token (VARCHAR, UNIQUE)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)

## Relationships

- User has many WorkspaceMembers → many Workspaces
- Workspace has many Connectors
- Workspace has many Queries
- User has many Queries

## Indexes

- users.email (UNIQUE)
- workspaces.slug (UNIQUE)
- workspace_members (workspace_id, user_id) (UNIQUE)
- sessions.token (UNIQUE)
- queries.workspace_id
- queries.user_id
- queries.created_at
