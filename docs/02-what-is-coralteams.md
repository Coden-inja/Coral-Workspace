# What Is CoralTeams

CoralTeams is a self-hosted enterprise platform built around Coral.

## Problem

Coral currently runs as a local tool:

- User installs Coral
- User configures connectors
- User stores keys
- User configures MCP
- User connects Claude/Cursor

This works for individuals but does not scale for companies.

## Solution

CoralTeams provides the missing enterprise layer.

A company deploys a single Docker stack. The platform provides:

- Multi-workspace management
- Team isolation
- OAuth authentication
- RBAC
- Connector management
- Hosted MCP endpoints
- Agent mode
- Web UI
- Local LLM integration

## Key Principle

All data remains inside company infrastructure. No company data leaves company-controlled systems.

## Three Product Modes

1. **Hosted MCP** — Developers connect their IDE (Claude, Cursor, etc.) to a hosted MCP endpoint. No local Coral install needed.

2. **Agent UI** — Non-technical users ask questions through a browser interface. Natural language queries are translated to Coral retrieval requests.

3. **External Integrations** — Slack, Teams, Discord, email, webhooks, n8n. Users interact with Coral through their existing tools.

## Deployment

A company deploys CoralTeams onto:

- AWS
- Azure
- GCP
- Bare metal
- Private cloud

Single deployment. Single URL.

Example: `https://coral.company.com`
