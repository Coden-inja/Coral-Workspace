FROM python:3.11-slim
WORKDIR /app

# Install native system engine dependencies
RUN apt-get update && apt-get install -y curl build-essential git wget tar && rm -rf /var/lib/apt/lists/*

# Fetch the pre-compiled binary from GitHub releases
RUN wget https://github.com/withcoral/coral/releases/latest/download/coral-x86_64-unknown-linux-gnu.tar.gz \
    && tar -xzf coral-x86_64-unknown-linux-gnu.tar.gz \
    && mv coral /usr/local/bin/ \
    && rm coral-x86_64-unknown-linux-gnu.tar.gz

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# CRITICAL HOTFIX: Create symlink to point app/models to app/schema/ schema_models to stop import crashes
RUN mkdir -p app/models \
    && echo "from app.schema.schema_models import *" > app/models/query.py \
    && echo "from app.schema.schema_models import *" > app/models/health.py

RUN chmod +x entrypoint.sh

EXPOSE 8001
ENTRYPOINT ["./entrypoint.sh"]
