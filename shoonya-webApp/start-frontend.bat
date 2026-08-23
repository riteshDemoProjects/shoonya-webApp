@echo off
REM Start the Shoonya Farms frontend (Vite/React) on http://localhost:5173
cd /d "%~dp0frontend"
set "PATH=C:\Users\ritesh.kumar03\nodejs;%PATH%"
echo Starting frontend on http://localhost:5173  (Ctrl+C to stop)
call npm run dev
pause
