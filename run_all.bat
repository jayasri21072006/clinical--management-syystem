@echo off
title Clinical Management System - Launcher
echo.
echo =====================================================
echo   Clinical Management System - Starting All Services
echo =====================================================
echo.

:: Launch Backend (FastAPI on port 8000)
echo [1/2] Starting Backend (FastAPI) on http://127.0.0.1:8000 ...
start "CMS Backend - FastAPI" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: Wait a moment for the backend to initialize before starting frontend
timeout /t 3 /nobreak >nul

:: Launch Frontend (Vite on port 5173)
echo [2/2] Starting Frontend (React Vite) on http://localhost:5173 ...
start "CMS Frontend - React Vite" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================
echo   Both servers launched in separate windows!
echo.
echo   Backend API:  http://127.0.0.1:8000
echo   Frontend UI:  http://localhost:5173
echo   API Docs:     http://127.0.0.1:8000/docs
echo =====================================================
echo.
timeout /t 5
