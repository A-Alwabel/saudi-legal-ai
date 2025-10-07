@echo off
echo Starting Saudi Legal AI System...
echo.

echo Starting Backend Server...
cd server
start /B npm run dev
cd ..

echo Starting Frontend Client...
cd client-nextjs  
start /B npm run dev
cd ..

echo.
echo Services are starting in background...
echo Wait 15 seconds then check:
echo - Backend:  http://localhost:8000
echo - Frontend: http://localhost:3005
echo.
timeout /t 15 /nobreak

echo Checking services...
curl -s http://localhost:8000 >nul 2>&1 && echo ✅ Backend: RUNNING || echo ❌ Backend: Not responding
curl -s http://localhost:3005 >nul 2>&1 && echo ✅ Frontend: RUNNING || echo ❌ Frontend: Not responding

echo.
echo 🎯 Access the system at: http://localhost:3005
pause
