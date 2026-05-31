#!/bin/bash
set -e
echo "Launching FastAPI semantic engine backend on port 8001..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8001
