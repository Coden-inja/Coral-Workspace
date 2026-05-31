FROM python:3.11-slim
WORKDIR /app

# Install native system engine dependencies
RUN apt-get update && apt-get install -y curl build-essential git && rm -rf /var/lib/apt/lists/*

# Dynamically fetch the native optimized architecture binary directly from the source setup line
RUN curl -fsSL https://withcoral.com/install.sh | sh

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x entrypoint.sh

EXPOSE 8001
ENTRYPOINT ["./entrypoint.sh"]
