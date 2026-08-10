@echo off
chcp 65001 >nul
title AERON MEDICAL - Revert To Last Checkpoint
echo ====================================================
echo  🔄 Reverting Codebase to Last Verified Checkpoint...
echo ====================================================

node "%~dp0revert.js"
if %ERRORLEVEL% NEQ 0 (
    "C:\Users\phons\AppData\Local\ms-playwright-go\1.57.0\node.exe" "%~dp0revert.js"
)

echo.
pause
