@echo off
title AI Quiz Challenge
echo ==========================================================
echo   AI QUIZ CHALLENGE AUTOMATED SERVER LAUNCHER
echo ==========================================================
echo.

:: Detect Node.js
set NODE_EXE=%~dp0node-env\node.exe
if not exist "%NODE_EXE%" (
    echo Local node-env not found. Using system Node.js...
    set NODE_EXE=node
)

:: Clear port 5000 if occupied
echo Clearing port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " ^| findstr "LISTENING"') do (
    echo Killing process %%a on port 5000...
    taskkill /f /pid %%a >nul 2>&1
)

:: Start the browser in a new window after a brief delay
echo Launching the application in your default browser...
start http://127.0.0.1:5000

:: Start the backend server
echo Starting Express server...
"%NODE_EXE%" "%~dp0backend\server.js"
pause
