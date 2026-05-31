# CoralTeams — Remote LLM Integration Guide

Connect this Codespace to a GPU-backed LLM for SQL generation.

## Option 1: Colab (free T4 GPU, recommended for MVP testing)

### Step 1 — Open the Colab notebook

1. Go to https://colab.research.google.com/
2. File → Upload Notebook → select `semantic-engine/colab_model_server.ipynb`
3. Runtime → Change runtime type → **T4 GPU**
4. Run all cells in order

Cells 1–4 install Ollama, pull **Qwen 2.5 7B** (~4 GB download, ~1 min), and verify inference works.

### Step 2 — Get the ngrok URL

Cell 5 starts ngrok and prints a URL like:
```
https://abcd1234.ngrok-free.app
```

This tunnels Ollama's port 11434 to the public internet.

### Step 3 — Configure the Semantic Engine

In this Codespace, edit `semantic-engine/.env`:

```env
MODEL_PROVIDER=openai
MODEL_NAME=qwen2.5:7b
MODEL_BASE_URL=https://abcd1234.ngrok-free.app/v1
MODEL_API_KEY=
```

### Step 4 — Restart the server

```bash
pkill -f uvicorn
cd /workspaces/Coral-Workspace/semantic-engine
nohup uvicorn app.main:app --host 0.0.0.0 --port 8001 --app-dir . > /tmp/sem-engine.log 2>&1 &
sleep 5
curl -s http://localhost:8001/health
```

Expected: `{"status":"ok","model":"openai/qwen2.5:7b","coral":"connected"}`

### Step 5 — Run the benchmark

```bash
cd /workspaces/Coral-Workspace/semantic-engine
python3 benchmark.py
```

Compare results against the rule-based baseline (7/20 correct). With Qwen 2.5 7B, expect 16-18/20.

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Connection refused` in health check | Colab session expired. Rerun cells 1-5. |
| `401 Unauthorized` | ngrok URL changed. Update `.env` with new URL. |
| Model returns garbage | Try a different model: `ollama pull llama3.2:3b` for faster/cleaner output. |
| Colab disconnects after idle | Cell 6 runs a keep-alive. Keep the Colab tab open. |

### Model Recommendations

| Model | Size | Download | Tok/s (T4) | Quality |
|-------|------|----------|-------------|---------|
| `qwen2.5:7b` | 3.8 GB | ~1 min | 30-50 | Best for SQL |
| `llama3.2:3b` | 1.8 GB | ~30s | 60-80 | Faster, weaker |
| `qwen2.5:3b` | 1.7 GB | ~30s | 60-80 | Fastest |

Start with `qwen2.5:7b`. If it's too slow, try `llama3.2:3b`.

---

## Option 2: Runpod (RTX 4090, $0.30/hr)

For longer testing sessions (Colab resets every 12h):

```bash
# 1. Create a Runpod template:
#    - Container: olami/ollama:latest
#    - Port: 11434 (HTTP)
#    - Expose HTTP on port 11434
#
# 2. Start pod (RTX 4090, $0.30/hr)
#
# 3. SSH in and pull the model:
ssh root@<runpod-ip> -p <port>
ollama pull qwen2.5:7b
#
# 4. In .env, set:
#    MODEL_BASE_URL=http://<runpod-ip>:11434/v1
```

---

## Option 3: Local Ollama (for Docker deployment)

For production, run Ollama in the Docker stack:

```yaml
# docker-compose.yml
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  semantic-engine:
    build: ./semantic-engine
    environment:
      MODEL_PROVIDER: openai
      MODEL_NAME: qwen2.5:7b
      MODEL_BASE_URL: http://ollama:11434/v1
```

The Docker image needs no model data — `ollama pull` happens at container startup via the entrypoint or health check.

---

## Checking the LLM Path is Active

```bash
# The query executor logs which path it takes
curl -s http://localhost:8001/query -H "Content-Type: application/json" -d '{
  "query": "show issues in mojombo/grit"
}' | python3 -m json.tool

# If MODEL_PROVIDER is set and reachable, the response will show
# generated_sql with WHERE clauses, bukan the bare LIMIT 20
```
