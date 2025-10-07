@echo off
echo ========================================
echo   Saudi Legal AI v2.0 - Mock Mode
echo ========================================
echo.
echo Starting Mock Server (No Database)...
start "Mock Server" cmd /k "cd server && node mock-server.js"
echo Mock server starting on port 5000...
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
echo Mock API:      http://localhost:5000/api
echo Frontend App:  http://localhost:3005
echo.
echo WARNING: Using mock server - data is temporary!
echo          Data will be lost when server stops.
echo.
echo Press any key to open the application...
pause >nul
start http://localhost:3005
