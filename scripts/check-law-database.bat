@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║     SAUDI LEGAL AI - LAW DATABASE STATUS CHECK            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Checking law database status...
echo.

curl -s http://localhost:5000/api/ai/law-database-stats

echo.
echo.
echo ═══════════════════════════════════════════════════════════
echo If you see "totalDocuments: 0", run:
echo    scripts\setup-law-database.bat
echo.
echo If you see an error, make sure the server is running:
echo    cd server ^&^& npm start
echo ═══════════════════════════════════════════════════════════
echo.
pause
