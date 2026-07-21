@echo off
color 0A
title Crypto Casino Launcher

echo ============================================
echo       STARTING PREMIUM CRYPTO CASINO
echo ============================================

echo.
echo Starting Backend Server...
start "Casino Backend" cmd /c "cd /d "%~dp0backend" && npm start"

echo.
echo Starting Frontend Server...
start "Casino Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Waiting for servers to start...
timeout /t 8 /nobreak

echo.
echo Opening Chrome...
start chrome http://localhost:3000

echo Done!
exit
