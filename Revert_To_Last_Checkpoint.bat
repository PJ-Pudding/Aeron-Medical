@echo off
chcp 65001 >nul
title AERON MEDICAL - Revert To Last Checkpoint
echo ====================================================
echo  🔄 Reverting Codebase to Last Verified Checkpoint...
echo ====================================================

node "d:\Team Projects\revert.js"

echo.
pause
