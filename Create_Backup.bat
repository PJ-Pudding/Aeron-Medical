@echo off
chcp 65001 >nul
title AERON MEDICAL - Create Checkpoint Backup
echo ====================================================
echo  📦 Creating Automated Checkpoint Backup...
echo ====================================================

node "d:\Team Projects\backup.js"

echo.
pause
