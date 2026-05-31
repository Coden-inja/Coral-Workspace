# What Is Coral

Coral is an open-source retrieval engine.

## Purpose

Coral's job is retrieval. It connects to external systems and fetches data on demand.

## Connectors

Coral connects to:

- GitHub
- GitLab
- Jira
- Notion
- Slack
- Datadog
- Sentry
- Google Workspace
- Databases
- Files

## Interfaces

Coral exposes:

- SQL interface — query connected systems with SQL
- API — programmatic access to data sources
- MCP — Model Context Protocol endpoints for AI assistants

## What Coral Is NOT

- Coral is NOT an AI model
- Coral is NOT a vector database
- Coral is NOT a RAG system

Coral fetches data. Models reason about data.

## Role in CoralTeams

Coral remains the source of truth for data retrieval. CoralTeams orchestrates Coral across workspaces, users, and authentication boundaries. The Semantic Engine translates natural language into Coral queries and interprets results.

Coral is the retrieval layer. It is never replaced by the Semantic Engine.
