# Agent Mode

## Purpose

Allow non-technical users to ask questions about their data using natural language through a browser interface.

## Target Users

- Managers
- Executives
- Non-technical employees

## Flow

```
Browser
  → CoralTeams UI (Agent Chat)
  → Backend
  → Semantic Engine
  → Coral
  → External Systems
  → Answer
```

## User Experience

The user opens the CoralTeams web UI, navigates to the Agent view, and types a question in natural language.

Examples:

- "Which projects are blocked because of missing reviews?"
- "Show employees with more than 10 unresolved Jira tickets."
- "What was the API latency spike at 3 PM yesterday?"

## What Happens Behind the Scenes

1. User types a question in the chat interface
2. Frontend sends the question to Backend
3. Backend authenticates and authorizes the user
4. Backend forwards to Semantic Engine
5. Semantic Engine classifies intent and generates Coral retrieval requests
6. Coral executes the retrieval against connected systems
7. Semantic Engine interprets evidence and produces a grounded answer
8. Answer is streamed back through Backend to Frontend

## Requirements

- No IDE required
- No MCP required
- No SQL required
- No technical knowledge required

## Streaming

Answers are streamed token by token to provide a responsive chat experience. The Frontend displays a typing indicator during generation.

## History

Conversation history is stored per user per workspace. Users can review past conversations and revisit previous answers.
