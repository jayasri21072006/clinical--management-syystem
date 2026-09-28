@echo off
title Clinical Management System - Full Stack Launcher
echo.
echo =====================================================
echo   Clinical Management System - Starting All Services
echo =====================================================
echo.

:: Get the directory where this script lives
set "ROOT=%~dp0"

:: Launch Backend (FastAPI on port 8000)
echo [1/2] Starting Backend (FastAPI) on http://127.0.0.1:8000 ...
start "" /B cmd /c "cd /d "%ROOT%backend" && .\venv\Scripts\python.exe -m pip install -r requirements.txt && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: Wait a moment for the backend to initialize
timeout /t 3 /nobreak >nul

:: Launch Frontend (Vite on port 5173)
echo [2/2] Starting Frontend (React Vite) on http://localhost:5173 ...
cd /d "%ROOT%frontend"
npm run dev

:: When frontend exits (Ctrl+C), kill backend too
taskkill /FI "WINDOWTITLE eq CMS Backend*" /F >nul 2>&1
