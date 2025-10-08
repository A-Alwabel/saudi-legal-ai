# Push Changes to GitHub - Saudi Legal AI
# PowerShell Version

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Push Changes to GitHub - Saudi Legal AI" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

Write-Host "[1/4] Checking Git status..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "[2/4] Adding all changes..." -ForegroundColor Yellow
git add .
Write-Host ""

Write-Host "[3/4] Creating commit..." -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update project files - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

git commit -m "$commitMessage"
Write-Host ""

Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Yellow
git push origin master
Write-Host ""

Write-Host "================================================" -ForegroundColor Green
Write-Host "  SUCCESS! Changes pushed to GitHub" -ForegroundColor Green
Write-Host "  https://github.com/A-Alwabel/saudi-legal-ai" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to exit"

