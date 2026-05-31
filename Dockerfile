FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    zstd \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set working directory
WORKDIR /app

# Install Coral binary
COPY coral_binary /usr/local/bin/coral
RUN chmod +x /usr/local/bin/coral

# Install Python dependencies
COPY semantic-engine/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire codebase
COPY . .

# Final working directory for the semantic engine
WORKDIR /app/semantic-engine

# Ensure entrypoint is in the active WORKDIR
RUN cp ../entrypoint.sh ./entrypoint.sh && chmod +x entrypoint.sh

# Expose FastAPI and Ollama ports
EXPOSE 8000
EXPOSE 11434

ENTRYPOINT ["./entrypoint.sh"]
