@echo off
chcp 65001 >nul
title AERON MEDICAL Web Server (Port 8085)
echo ====================================================
echo  🚀 Starting AERON MEDICAL Web Server...
echo ====================================================

node "d:\Team Projects\server.js"
if %ERRORLEVEL% NEQ 0 (
    powershell -ExecutionPolicy Bypass -File "d:\Team Projects\server.ps1"
)

pause
