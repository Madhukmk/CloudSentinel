@echo off
setlocal enabledelayedexpansion
title Stop CloudSentinel Platform

echo ===============================================================================
echo                STOPPING CLOUDSENTINEL SERVICES (PORTS 8088, 5173)
echo ===============================================================================
echo.

:: 1. Terminate process on port 8088 (Backend)
echo Stopping Backend (Port 8088)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8088" ^| findstr "LISTENING"') do (
    echo  - Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

:: 2. Terminate process on port 5173 (Frontend)
echo.
echo Stopping Frontend (Port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo  - Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ===============================================================================
echo               ALL CLOUDSENTINEL SERVICES HAVE BEEN STOPPED
echo ===============================================================================
echo.
pause
