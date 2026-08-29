@echo off
echo Starting Clinical Management System Backend with Virtual Environment (FastAPI)...
cd /d "%~dp0backend"
if exist "venv\Scripts\python.exe" (
    echo Checking backend dependencies...
    ".\venv\Scripts\python.exe" -m pip install -r requirements.txt
    ".\venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
) else (
    pip install -r requirements.txt
    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
)
pause

