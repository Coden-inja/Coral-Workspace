# Workspace Model

## Concept

A workspace is an isolated environment within a CoralTeams deployment. Each workspace represents a team, project, or organizational unit.

## Isolation

- Data isolation — each workspace has its own connectors, queries, and settings
- User isolation — users belong to specific workspaces
- Configuration isolation — connector credentials are scoped per workspace

## Workspace Properties

- Name
- Slug (URL-friendly identifier)
- Description
- Owner (user or team)
- Created date
- Status (active, inactive, archived)

## Membership

Users can belong to multiple workspaces. Each membership has a role:

- Owner — full control
- Admin — manage connectors, users, settings
- Member — use connectors and queries
- Viewer — read-only access

## Default Workspace

On first deployment, a default workspace is created automatically. The initial admin user is assigned as owner.

## Workspace Lifecycle

1. Created by admin or owner
2. Connectors are configured within workspace
3. Users are invited and assigned roles
4. Workspace can be archived when no longer needed
5. Archived workspaces can be restored or deleted
