@echo off
echo ========================================
echo   SAUDI LEGAL AI v2 - PRODUCTION START
echo ========================================
echo.

REM Kill any existing processes
echo Stopping any running processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

REM Start backend
echo.
echo [1/2] Starting Backend Server...
start "Saudi Legal AI - Backend" cmd /k "cd server && node db-server.js"
timeout /t 5

REM Start frontend
echo [2/2] Starting Frontend Application...
cd client-nextjs
start "Saudi Legal AI - Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   SYSTEM STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3005
echo.
echo Login Credentials:
echo   Email:    demo@saudilegal.com
echo   Password: password123
echo.
echo Press any key to open browser...
pause >nul

REM Open browser
start http://localhost:3005

echo.
echo System is running. Close this window to stop.
pause
