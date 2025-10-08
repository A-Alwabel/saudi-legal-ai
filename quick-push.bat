@echo off
REM Quick Push - Add, Commit, Push in one command
cd /d "%~dp0"
git add .
git commit -m "Quick update - %date% %time%"
git push origin master
echo Changes pushed to GitHub!
timeout /t 3

