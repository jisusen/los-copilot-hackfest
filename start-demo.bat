@echo off
setlocal

echo ===========================================================
echo   Credit Analyst Copilot - Hackathon Demo Starter
echo ===========================================================
echo.

set "ROOT=%~dp0"
set "LOS_PORT=3333"
set "DASH_PORT=3003"

:: Check if ports are in use and kill processes
echo Checking ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%LOS_PORT% ^| findstr LISTENING') do (
    echo Stopping process on port %LOS_PORT% (PID: %%a)...
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%DASH_PORT% ^| findstr LISTENING') do (
    echo Stopping process on port %DASH_PORT% (PID: %%a)...
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo [1/2] Resetting LOS database...
cd /d "%ROOT%"
bun run server/db/seed.ts --reset
if errorlevel 1 (
    echo Database reset failed!
    exit /b 1
)

echo.
echo [2/2] Starting LOS Demo and Dashboard...
echo Press Ctrl+C to stop both servers.
echo.

bun run demo

echo.
echo Servers stopped.
endlocal
