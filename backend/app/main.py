from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "CoralOps Backend Running"}

@app.get("/health")
def health():
    return {"status": "healthy"}