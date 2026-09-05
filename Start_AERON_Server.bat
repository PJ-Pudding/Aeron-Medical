@echo off
chcp 65001 >nul
title AERON MEDICAL Web Server (Port 8085)
echo ====================================================
echo  🚀 Starting AERON MEDICAL Web Server...
echo ====================================================

set "NODE_BIN=node"
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist "%LOCALAPPDATA%\ms-playwright-go\1.57.0\node.exe" (
        set "NODE_BIN=%LOCALAPPDATA%\ms-playwright-go\1.57.0\node.exe"
    )
)

"%NODE_BIN%" "%~dp0server.js"
if %ERRORLEVEL% NEQ 0 (
    echo [Notice] Falling back to PowerShell Server...
    powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
)

pause
