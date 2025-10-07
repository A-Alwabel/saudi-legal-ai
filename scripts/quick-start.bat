@echo off
echo === SAUDI LEGAL AI SYSTEM ===
echo.
echo Installing required packages and starting services...
echo This will take a few minutes on first run.
echo.

echo Installing nodemon globally...
npm install -g nodemon

echo Installing Next.js globally...
npm install -g next

echo.
echo Starting Backend Server (Port 8000)...
cd server
start "Backend Server" cmd /k "npm run dev"
cd ..

timeout /t 5

echo Starting Frontend Client (Port 3005)...
cd client-nextjs
start "Frontend Client" cmd /k "npm run dev" 
cd ..

echo.
echo ✅ Services are starting in separate windows
echo ⏳ Wait about 30 seconds for full startup
echo.
echo 🌐 Access the system at: http://localhost:3005
echo 🔧 Backend API at: http://localhost:8000
echo.
echo Press any key to exit...
pause >nul
