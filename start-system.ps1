# Saudi Legal AI System - Startup Script
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     SAUDI LEGAL AI SYSTEM - STARTING...                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Start Backend Server
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; Write-Host '🔧 Backend Server Starting...' -ForegroundColor Yellow; node db-server.js"

# Wait a bit for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client-nextjs'; Write-Host '🎨 Frontend Server Starting...' -ForegroundColor Yellow; npm run dev"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              SYSTEM STARTING...                             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Two PowerShell windows will open:" -ForegroundColor White
Write-Host "  1. 🔧 Backend Server (Port 5000)" -ForegroundColor Cyan
Write-Host "  2. 🎨 Frontend Server (Port 3005)" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Wait 10-15 seconds for servers to start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Then open your browser:" -ForegroundColor White
Write-Host "  👉 http://localhost:3005" -ForegroundColor Green
Write-Host ""
Write-Host "Login with:" -ForegroundColor White
Write-Host "  📧 Email: demo@saudilegal.com" -ForegroundColor Cyan
Write-Host "  🔑 Password: password123" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to open browser in 10 seconds..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Sleep -Seconds 10
Start-Process "http://localhost:3005"

Write-Host ""
Write-Host "✅ System should be running now!" -ForegroundColor Green
Write-Host ""
Write-Host "If you see errors, check the two PowerShell windows." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
