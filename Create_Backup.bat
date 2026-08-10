@echo off
chcp 65001 >nul
title AERON MEDICAL - Create Checkpoint Backup
echo ====================================================
echo  📦 Creating Automated Checkpoint Backup...
echo ====================================================

node "%~dp0backup.js"
if %ERRORLEVEL% NEQ 0 (
    "C:\Users\phons\AppData\Local\ms-playwright-go\1.57.0\node.exe" "%~dp0backup.js"
)

echo.
pause
