@echo off
echo Setting up helpful Git aliases...
echo.

REM Quick status
git config --global alias.s "status"

REM Quick add all
git config --global alias.a "add ."

REM Quick commit
git config --global alias.c "commit -m"

REM Quick push
git config --global alias.p "push origin master"

REM Quick pull
git config --global alias.pl "pull origin master"

REM View log nicely
git config --global alias.lg "log --oneline --graph --decorate --all"

REM Quick push all (add + commit + push)
git config --global alias.qp "!git add . && git commit -m 'Quick update' && git push origin master"

REM Undo last commit (keep changes)
git config --global alias.undo "reset HEAD~1 --soft"

echo.
echo ✅ Git aliases configured successfully!
echo.
echo You can now use short commands:
echo   git s      = git status
echo   git a      = git add .
echo   git c      = git commit -m
echo   git p      = git push origin master
echo   git pl     = git pull origin master
echo   git lg     = nice log view
echo   git qp     = quick push everything
echo   git undo   = undo last commit
echo.
pause

