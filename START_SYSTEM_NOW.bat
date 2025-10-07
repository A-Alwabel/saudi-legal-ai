@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║     SAUDI LEGAL AI SYSTEM - STARTING NOW                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Starting backend server...
echo.

cd server
start "Saudi Legal AI - Backend" cmd /k "node db-server.js"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo Starting frontend...
echo.

cd ..\client-nextjs
start "Saudi Legal AI - Frontend" cmd /k "npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                  SYSTEM STARTING...                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Two windows will open:
echo   1. Backend Server (Port 5000)
echo   2. Frontend Server (Port 3005)
echo.
echo Wait 10-15 seconds, then open your browser:
echo.
echo   👉 http://localhost:3005
echo.
echo Login with:
echo   Email: demo@saudilegal.com
echo   Password: password123
echo.
echo Press any key to open browser automatically...
pause > nul

timeout /t 10 /nobreak > nul
start http://localhost:3005

echo.
echo ✅ System should be running now!
echo.
echo If you see errors, check the two terminal windows that opened.
echo.
pause
