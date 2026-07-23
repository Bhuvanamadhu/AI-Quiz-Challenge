@echo off
title AI Quiz Challenge Launcher
echo ==========================================================
echo   AI QUIZ CHALLENGE AUTOMATED SERVER LAUNCHER
echo ==========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1"
pause
