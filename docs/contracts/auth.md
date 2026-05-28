# Auth Contract

Defines authentication APIs, JWT flow, and session handling.

Owned by: Backend Team
Consumed by: Frontend Team

# Base URL

http://localhost:8000

# Signup API

## Endpoint

POST /signup

## Description

Creates a new user account.

## Request Body

```json
{
  "email": "string",
  "password": "string"
}
