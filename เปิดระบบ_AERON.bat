@echo off
title AERON MEDICAL Web Server (Port 8085)
echo ====================================================
echo   🚀 กำลังคอมไพล์และเปิดระบบ AERON MEDICAL...
echo   🌐 จะเปิดเบราว์เซอร์ไปที่: http://localhost:8085/
echo ====================================================

"C:\Users\phons\AppData\Local\ms-playwright-go\1.57.0\node.exe" "d:\Team Projects\build.js"

powershell -ExecutionPolicy Bypass -Command "$p = Get-NetTCPConnection -LocalPort 8085 -ErrorAction SilentlyContinue; if ($p) { Stop-Process -Id $p.OwningProcess -Force -ErrorAction SilentlyContinue }"

start powershell -NoExit -ExecutionPolicy Bypass -File "d:\Team Projects\server.ps1"
timeout /t 2 /nobreak >nul
start http://localhost:8085/
