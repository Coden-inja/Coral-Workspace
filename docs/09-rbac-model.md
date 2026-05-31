# RBAC Model

## Overview

Role-Based Access Control governs what users can do across the platform. Roles are assigned at the workspace level and at the global level.

## Global Roles

Global roles apply across the entire CoralTeams deployment.

| Role     | Permissions |
|----------|-------------|
| Admin    | Full platform access, create workspaces, manage users, view all workspaces |
| Member   | Access assigned workspaces only |

## Workspace Roles

Workspace roles apply within a specific workspace.

| Role   | Permissions |
|--------|-------------|
| Owner  | Full workspace control, delete workspace, manage roles |
| Admin  | Manage connectors, manage users, manage queries, view settings |
| Member | Run queries, view results, use MCP endpoints |
| Viewer | View dashboard and query results only |

## Permission Matrix

| Action                     | Global Admin | Workspace Owner | Workspace Admin | Workspace Member | Workspace Viewer |
|----------------------------|:-----------:|:--------------:|:--------------:|:--------------:|:--------------:|
| Create workspace           | ✅          | ❌             | ❌             | ❌             | ❌             |
| Delete workspace           | ✅          | ✅             | ❌             | ❌             | ❌             |
| Manage workspace users     | ✅          | ✅             | ✅             | ❌             | ❌             |
| Configure connectors       | ✅          | ✅             | ✅             | ❌             | ❌             |
| Set workspace roles        | ✅          | ✅             | ❌             | ❌             | ❌             |
| Run queries                | ✅          | ✅             | ✅             | ✅             | ❌             |
| View results               | ✅          | ✅             | ✅             | ✅             | ✅             |
| Use MCP endpoint           | ✅          | ✅             | ✅             | ✅             | ❌             |
| View workspace settings    | ✅          | ✅             | ✅             | ❌             | ❌             |
| Access agent mode          | ✅          | ✅             | ✅             | ✅             | ❌             |

## Enforcement

RBAC is enforced at the Backend layer. The Backend validates user roles before processing any request. The Frontend respects role-based UI visibility but does not enforce access control.
