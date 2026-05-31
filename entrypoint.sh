#!/bin/bash
set -e

# Start Ollama engine in the background
export OLLAMA_HOST=0.0.0.0:11434
nohup ollama serve > /tmp/ollama.log 2>&1 &

# Wait for Ollama service readiness
echo "Waiting for Ollama to accept connections..."
for i in {1..30}; do
    if curl -s http://localhost:11434/api/tags > /dev/null; then
        echo "Ollama service is ready."
        break
    fi
    sleep 2
done

# Pull the exact verified target model layer
echo "Pulling qwen3:8b model layers..."
ollama pull qwen3:8b

# Wait for model registry mapping confirmation
echo "Verifying model mapping availability..."
for i in {1..120}; do
    if curl -s http://localhost:11434/api/tags | grep -q "qwen3:8b"; then
        echo "qwen3:8b engine is fully loaded and ready."
        break
    fi
    sleep 5
done

# Start the primary FastAPI semantic-engine web server
echo "Launching FastAPI semantic engine backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
