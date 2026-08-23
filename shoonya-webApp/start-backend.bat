@echo off
REM Start the Shoonya Farms storefront backend (FastAPI) on http://localhost:8001
cd /d "%~dp0backend"
echo Starting storefront backend on http://localhost:8001  (Ctrl+C to stop)
".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8001
pause
