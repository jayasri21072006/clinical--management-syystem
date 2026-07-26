from fastapi import FastAPI

app = FastAPI(
    title="Clinical Management System API",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Clinical Management System Backend is Running 🚀"
    }