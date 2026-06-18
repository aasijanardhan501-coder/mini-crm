@echo off
title Mini CRM Launcher
echo Starting Mini CRM...
echo.

echo [1/2] Starting Backend Server...
start "Mini CRM - Backend" cmd /k "cd /d "%~dp0server" && npm start"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend (Vite)...
start "Mini CRM - Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Frontend will be available at: http://localhost:5173
echo Backend  will be available at: http://localhost:5000
echo.
pause
