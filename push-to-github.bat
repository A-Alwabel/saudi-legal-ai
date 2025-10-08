@echo off
echo ================================================
echo   Push Changes to GitHub - Saudi Legal AI
echo ================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Git status...
git status
echo.

echo [2/4] Adding all changes...
git add .
echo.

echo [3/4] Creating commit...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message=Update project files

git commit -m "%commit_message%"
echo.

echo [4/4] Pushing to GitHub...
git push origin master
echo.

echo ================================================
echo   SUCCESS! Changes pushed to GitHub
echo   https://github.com/A-Alwabel/saudi-legal-ai
echo ================================================
echo.
pause

