Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   Clinical Management System - Starting All Services    " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan

$rootDir = $PSScriptRoot

Start-Process cmd -ArgumentList "/k cd /d `"$rootDir\backend`" && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
Start-Process cmd -ArgumentList "/k cd /d `"$rootDir\frontend`" && npm run dev"

Write-Host "Both Backend & Frontend servers launched!" -ForegroundColor Yellow
Write-Host "Backend API: http://127.0.0.1:8000" -ForegroundColor Gray
Write-Host "Frontend UI:  http://localhost:5173" -ForegroundColor Gray
