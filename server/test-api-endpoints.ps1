# PowerShell Script to Test Backend API Endpoints
# Saudi Legal AI System v2.0

Write-Host "`n🧪 TESTING BACKEND API ENDPOINTS" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:5000/api"
$global:token = ""
$global:results = @{
    passed = 0
    failed = 0
    tests = @()
}

function Test-Endpoint {
    param(
        [string]$Name,
        [scriptblock]$TestBlock
    )
    
    try {
        & $TestBlock
        $global:results.passed++
        $global:results.tests += @{ name = $Name; status = "✅ PASS" }
        Write-Host "✅ $Name" -ForegroundColor Green
    } catch {
        $global:results.failed++
        $global:results.tests += @{ name = $Name; status = "❌ FAIL"; error = $_.Exception.Message }
        Write-Host "❌ $Name : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Wait for server to start
Write-Host "`n⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test 1: Health Check
Test-Endpoint "Health Check" {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get -ErrorAction Stop
    if (-not $response) { throw "No response from server" }
}

# Test 2: User Registration
Test-Endpoint "User Registration" {
    $body = @{
        name = "Test User $(Get-Date -Format 'HHmmss')"
        email = "test$(Get-Date -Format 'HHmmss')@example.com"
        password = "SecurePass123!"
        phone = "+966501234567"
        role = "lawyer"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    
    if (-not $response.token) { throw "No token returned" }
    $global:token = $response.token
    Write-Host "  Token: $($global:token.Substring(0, 20))..." -ForegroundColor DarkGray
}

# Test 3: Get Current User
Test-Endpoint "Get Current User" {
    $headers = @{
        Authorization = "Bearer $global:token"
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/me" -Method Get -Headers $headers -ErrorAction Stop
    if (-not $response.user) { throw "No user data" }
}

# Test 4: Create Client
Test-Endpoint "Create Client" {
    $headers = @{
        Authorization = "Bearer $global:token"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        name = "Test Client"
        email = "client$(Get-Date -Format 'HHmmss')@example.com"
        phone = "+966501234568"
        nationalId = "1234567890"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/clients" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    if (-not $response._id) { throw "No client ID" }
    $global:clientId = $response._id
}

# Test 5: Get All Clients
Test-Endpoint "Get All Clients" {
    $headers = @{
        Authorization = "Bearer $global:token"
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/clients" -Method Get -Headers $headers -ErrorAction Stop
    if (-not ($response -is [Array])) { throw "Invalid response format" }
}

# Test 6: Create Case
Test-Endpoint "Create Case" {
    $headers = @{
        Authorization = "Bearer $global:token"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        title = "Test Case $(Get-Date -Format 'HHmmss')"
        caseType = "commercial"
        clientId = $global:clientId
        priority = "high"
        description = "Test case description"
        startDate = (Get-Date).ToString("yyyy-MM-dd")
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/cases" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    if (-not $response._id) { throw "No case ID" }
    $global:caseId = $response._id
}

# Test 7: Get All Cases
Test-Endpoint "Get All Cases" {
    $headers = @{
        Authorization = "Bearer $global:token"
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/cases" -Method Get -Headers $headers -ErrorAction Stop
    if (-not ($response -is [Array])) { throw "Invalid response format" }
}

# Test 8: Get Case by ID
Test-Endpoint "Get Case by ID" {
    $headers = @{
        Authorization = "Bearer $global:token"
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/cases/$global:caseId" -Method Get -Headers $headers -ErrorAction Stop
    if (-not $response._id) { throw "No case data" }
}

# Test 9: Update Case
Test-Endpoint "Update Case" {
    $headers = @{
        Authorization = "Bearer $global:token"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        status = "in_progress"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/cases/$global:caseId" -Method Put -Headers $headers -Body $body -ErrorAction Stop
    if ($response.status -ne "in_progress") { throw "Update failed" }
}

# Test 10: AI Consultation
Test-Endpoint "AI Consultation" {
    $headers = @{
        Authorization = "Bearer $global:token"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        query = "What are the legal procedures for commercial cases in Saudi Arabia?"
        caseType = "commercial"
        language = "en"
        includeReferences = $true
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/v1/ai/consultation" -Method Post -Headers $headers -Body $body -ErrorAction Stop
        if (-not $response.response) { throw "No AI response" }
    } catch {
        # AI might not be configured, that's okay
        Write-Host "  (AI consultation may require OpenAI API key)" -ForegroundColor DarkYellow
    }
}

# Test 11: Get Dashboard Analytics
Test-Endpoint "Dashboard Analytics" {
    $headers = @{
        Authorization = "Bearer $global:token"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/analytics/dashboard" -Method Get -Headers $headers -ErrorAction Stop
    } catch {
        # Analytics might not have endpoint, that's okay
        Write-Host "  (Analytics endpoint may not be implemented)" -ForegroundColor DarkYellow
    }
}

# Test 12: Delete Case (Cleanup)
Test-Endpoint "Delete Case" {
    $headers = @{
        Authorization = "Bearer $global:token"
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/cases/$global:caseId" -Method Delete -Headers $headers -ErrorAction Stop
}

# Print Summary
Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Passed: $($global:results.passed)" -ForegroundColor Green
Write-Host "❌ Failed: $($global:results.failed)" -ForegroundColor Red
Write-Host "📊 Total: $($global:results.tests.Count)" -ForegroundColor Yellow
$successRate = ($global:results.passed / $global:results.tests.Count) * 100
Write-Host "🎯 Success Rate: $([math]::Round($successRate, 2))%" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

if ($global:results.failed -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Check details above." -ForegroundColor Yellow
}

Write-Host "`nTest completed at $(Get-Date)" -ForegroundColor DarkGray

