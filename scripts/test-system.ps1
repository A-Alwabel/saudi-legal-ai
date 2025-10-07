Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SAUDI LEGAL AI - SYSTEM TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Backend Health
Write-Host "1. Testing Backend Server..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health"
    Write-Host "   ✓ Backend: RUNNING" -ForegroundColor Green
    Write-Host "   ✓ Database: $($health.database.ToUpper())" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend: NOT RUNNING" -ForegroundColor Red
}

# Test Frontend
Write-Host ""
Write-Host "2. Testing Frontend Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3005" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Frontend: RUNNING" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Frontend: NOT RUNNING" -ForegroundColor Red
}

# Test Authentication
Write-Host ""
Write-Host "3. Testing Authentication..." -ForegroundColor Yellow
$loginData = @{
    email = "demo@saudilegal.com"
    password = "password123"
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body $loginData -ContentType "application/json"
    Write-Host "   ✓ Login: SUCCESS" -ForegroundColor Green
    Write-Host "   ✓ User: $($authResponse.data.user.name)" -ForegroundColor Green
    Write-Host "   ✓ Token: Generated" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Login: FAILED" -ForegroundColor Red
}

# Test Database Data
Write-Host ""
Write-Host "4. Testing Database Content..." -ForegroundColor Yellow
try {
    $cases = Invoke-RestMethod -Uri "http://localhost:5000/api/cases"
    $clients = Invoke-RestMethod -Uri "http://localhost:5000/api/clients"
    $tasks = Invoke-RestMethod -Uri "http://localhost:5000/api/tasks"
    
    Write-Host "   ✓ Cases: $($cases.total) found" -ForegroundColor Green
    Write-Host "   ✓ Clients: $($clients.total) found" -ForegroundColor Green
    Write-Host "   ✓ Tasks: $($tasks.total) found" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Database query: FAILED" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Frontend URL: http://localhost:3005" -ForegroundColor White
Write-Host "🔐 Login: demo@saudilegal.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to open the application in your browser..."
Read-Host
Start-Process "http://localhost:3005"
