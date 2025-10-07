Write-Host "Testing Backend Health..." -ForegroundColor Cyan

try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
    Write-Host "✅ Backend Health:" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "❌ Backend Health Check Failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`nTesting Login Endpoint..." -ForegroundColor Cyan

try {
    $body = @{
        email = "demo@saudilegal.com"
        password = "password123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body $body
    Write-Host "✅ Login Successful:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Login Failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" $_.ErrorDetails.Message
    }
}

