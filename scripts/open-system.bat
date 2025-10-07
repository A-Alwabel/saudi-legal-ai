@echo off
cls
echo ===============================================
echo   SAUDI LEGAL AI v2.0 - SYSTEM LAUNCHER
echo ===============================================
echo.
echo Checking system status...
echo.

:: Check if backend is running
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Backend Server: Running on port 5000
) else (
    echo [!!] Backend Server: Not running
    echo      Run: cd server ^&^& node db-server.js
)

:: Check if frontend is running  
curl -s http://localhost:3005 >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Frontend App: Running on port 3005
) else (
    echo [!!] Frontend App: Not running
    echo      Run: cd client-nextjs ^&^& npm run dev
)

echo.
echo ===============================================
echo   SYSTEM ACCESS
echo ===============================================
echo.
echo Frontend URL: http://localhost:3005
echo Backend API:  http://localhost:5000/api
echo.
echo Login Credentials:
echo   Email:    demo@saudilegal.com
echo   Password: password123
echo.
echo ===============================================
echo.
echo Opening application in browser...
timeout /t 2 /nobreak >nul
start http://localhost:3005
echo.
echo Browser opened! Login with the credentials above.
echo.
pause
