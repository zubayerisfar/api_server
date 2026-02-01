@echo off
REM Islamic Content API - Quick Start Script

echo.
echo ╔════════════════════════════════════════╗
echo ║  Islamic Content API - Node.js Server  ║
echo ╚════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)

echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo [3/3] Starting server...
echo.
echo ✓ Server starting on http://localhost:5000
echo ✓ API Documentation: http://localhost:5000
echo ✓ Press Ctrl+C to stop the server
echo.

node server.js
