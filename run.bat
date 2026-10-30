@echo off
setlocal enabledelayedexpansion
title CloudSentinel SIEM Platform Launcher

echo ===============================================================================
echo            CLOUDSENTINEL - CLOUD-BASED SIEM PLATFORM LAUNCHER
echo ===============================================================================
echo.

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

:: 1. Verify Java Environment
echo [1/4] Checking Java environment...
where java >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Java is not found on your system PATH.
    echo Please install JDK 21+ and ensure 'java' is added to PATH.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('java -version 2^>^&1') do (
    set "JAVA_VER=%%i"
    goto :java_ver_done
)
:java_ver_done
echo    - Found: %JAVA_VER%

echo [2/4] Checking Node.js and npm environment...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found on your system PATH.
    echo Please install Node.js v18 or higher from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v 2^>^&1') do set "NODE_VER=%%i"
echo    - Found Node: %NODE_VER%

:: 3. Launch Backend API Server in a new window
echo.
echo [3/4] Starting CloudSentinel Backend (Spring Boot 3.3.3 on Port 8088)...
start "CloudSentinel - Backend [Port 8088]" cmd /k "cd /d "%BACKEND_DIR%" && echo [BACKEND] Bootstrapping CloudSentinel Spring Boot API Server... && call mvnw.cmd spring-boot:run"

:: 4. Launch Frontend Vite Server in a new window
echo.
echo [4/4] Starting CloudSentinel Frontend (React 19 + Vite on Port 5173)...
if not exist "%FRONTEND_DIR%\node_modules" (
    echo    - node_modules not found. Installing dependencies...
    start "CloudSentinel - Frontend [Port 5173]" cmd /k "cd /d "%FRONTEND_DIR%" && npm install && echo [FRONTEND] Starting Vite Development Server... && npm run dev"
) else (
    start "CloudSentinel - Frontend [Port 5173]" cmd /k "cd /d "%FRONTEND_DIR%" && echo [FRONTEND] Starting Vite Development Server... && npm run dev"
)

echo.
echo ===============================================================================
echo                    CLOUDSENTINEL SYSTEM INITIALIZED
echo ===============================================================================
echo.
echo  * Frontend Application:      http://localhost:5173
echo  * Backend API Base:           http://localhost:8088/api
echo  * Swagger API Documentation:  http://localhost:8088/swagger-ui.html
echo  * H2 Database Console:        http://localhost:8088/h2-console
echo    - JDBC URL: jdbc:h2:mem:cloudsentinel;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL
echo    - User: sa  (Password: blank)
echo.
echo  ----------------------------- DEMO CREDENTIALS -----------------------------
echo   [Administrator]  admin@cloudsentinel.com   /  Admin@123
echo   [Security Analyst] analyst@cloudsentinel.com /  Analyst@123
echo  ----------------------------------------------------------------------------
echo.
echo Waiting 12 seconds for Spring Boot and Vite to initialize, then opening browser...
timeout /t 12 /nobreak >nul
start http://localhost:5173

echo.
echo Note: To stop the platform, close the two opened terminal windows or run 'stop.bat'.
echo.
pause
