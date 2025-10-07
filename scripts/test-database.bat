@echo off
echo ===============================================
echo  Testing MongoDB Atlas Connection
echo ===============================================
echo.
echo Your IP Address: 5.163.146.13
echo.
echo Make sure this IP is whitelisted in MongoDB Atlas:
echo 1. Go to https://cloud.mongodb.com/
echo 2. Click "Network Access"
echo 3. Add IP: 5.163.146.13
echo    OR click "Allow Access from Anywhere"
echo.
echo Press any key to start the database server...
pause >nul
echo.
echo Starting Database Server...
cd server
node db-server.js
