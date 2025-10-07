@echo off
echo ========================================
echo   Saudi Legal AI v2.0 - Database Mode
echo ========================================
echo.
echo Starting MongoDB Database Server...
start "Database Server" cmd /k "cd server && node db-server.js"
echo Database server starting on port 5000...
echo.
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Application...
start "Frontend Application" cmd /k "cd client-nextjs && npm run dev"
echo Frontend starting on port 3005...
echo.
timeout /t 3 /nobreak >nul
echo.
echo ========================================
echo   Servers are starting up...
echo ========================================
echo.
echo Database API:  http://localhost:5000/api
echo Frontend App:  http://localhost:3005
echo.
echo Default Login:
echo   Email: demo@saudilegal.com
echo   Password: password123
echo.
echo Press any key to open the application...
pause >nul
start http://localhost:3005
