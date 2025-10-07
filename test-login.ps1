$body = @{
    email = "demo@saudilegal.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body $body

Write-Host "Login Response:" -ForegroundColor Green
$response | ConvertTo-Json -Depth 5
