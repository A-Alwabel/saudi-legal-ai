@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║     SAUDI LEGAL AI - LAW DATABASE SETUP                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo This script will:
echo 1. Install required dependencies (pdf-parse)
echo 2. Process all PDF laws from C:\Users\User\Desktop\law
echo 3. Load them into MongoDB database
echo.
echo Press any key to continue...
pause > nul

echo.
echo ═══════════════════════════════════════════════════════════
echo Step 1: Installing Dependencies
echo ═══════════════════════════════════════════════════════════
cd server
call npm install pdf-parse

echo.
echo ═══════════════════════════════════════════════════════════
echo Step 2: Processing PDF Laws
echo ═══════════════════════════════════════════════════════════
echo.
echo This may take a few minutes depending on the number of PDFs...
echo.
call npm run process-laws

echo.
echo ═══════════════════════════════════════════════════════════
echo ✅ SETUP COMPLETE!
echo ═══════════════════════════════════════════════════════════
echo.
echo Your AI system is now using REAL Saudi laws from PDFs!
echo.
echo Next steps:
echo 1. Start the server: cd server ^&^& npm start
echo 2. Start the frontend: cd client-nextjs ^&^& npm run dev
echo 3. Test AI consultation at http://localhost:3005
echo.
echo Press any key to exit...
pause > nul
