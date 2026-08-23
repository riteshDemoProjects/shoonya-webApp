@echo off
REM Launch both Shoonya Farms servers in separate windows, then open the browser.
start "Shoonya Backend"  "%~dp0start-backend.bat"
start "Shoonya Frontend" "%~dp0start-frontend.bat"
echo.
echo Both servers are starting in separate windows...
echo Waiting a few seconds, then opening http://localhost:5173
timeout /t 6 /nobreak >nul
start "" http://localhost:5173
