FROM python:3.11-slim
WORKDIR /app

# Install native system engine dependencies (including ca-certificates for secure downloads)
RUN apt-get update && apt-get install -y ca-certificates curl build-essential git wget tar && rm -rf /var/lib/apt/lists/*

# Fetch the pre-compiled binary from GitHub releases
RUN wget https://github.com/withcoral/coral/releases/latest/download/coral-x86_64-unknown-linux-gnu.tar.gz \
    && tar -xzf coral-x86_64-unknown-linux-gnu.tar.gz \
    && mv coral /usr/local/bin/ \
    && chmod +x /usr/local/bin/coral \
    && rm coral-x86_64-unknown-linux-gnu.tar.gz

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

# Directly call uvicorn to prevent CRLF line ending bugs in entrypoint.sh on Windows-built containers
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
