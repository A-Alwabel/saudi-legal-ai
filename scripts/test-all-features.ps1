# Saudi Legal AI v2 - Complete Feature Test Script
# This script tests ALL features and endpoints

$baseUrl = "http://localhost:5000/api"
$testResults = @{
    Passed = 0
    Failed = 0
    Errors = @()
}

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [string]$Description,
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    Write-Host "`nTesting: $Description" -ForegroundColor Cyan
    Write-Host "  $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✅ SUCCESS" -ForegroundColor Green
        $script:testResults.Passed++
        return $response
    } catch {
        Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults.Failed++
        $script:testResults.Errors += @{
            Test = $Description
            Error = $_.Exception.Message
        }
        return $null
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  SAUDI LEGAL AI v2 - FEATURE TEST" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Test 1: Health Check
Write-Host "`n1. BACKEND HEALTH" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/../api/health" -Description "Health Check"

# Test 2: Authentication
Write-Host "`n2. AUTHENTICATION" -ForegroundColor Magenta
$loginResponse = Test-Endpoint -Method "POST" -Url "$baseUrl/auth/login" `
    -Body @{email="demo@saudilegal.com"; password="password123"} `
    -Description "User Login"

if ($loginResponse -and $loginResponse.token) {
    $token = $loginResponse.token
    Write-Host "  ✅ Token received" -ForegroundColor Green
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
} else {
    $token = $null
    $authHeaders = @{"Content-Type" = "application/json"}
}

# Test 3: Cases Management
Write-Host "`n3. CASES MANAGEMENT" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/cases" -Description "List All Cases"
$newCase = Test-Endpoint -Method "POST" -Url "$baseUrl/cases" `
    -Body @{
        title="Test Case"
        titleAr="قضية تجريبية"
        type="civil"
        status="active"
        clientId="test-client-id"
    } `
    -Description "Create New Case"

# Test 4: Tasks Management
Write-Host "`n4. TASKS MANAGEMENT" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/tasks" -Description "List All Tasks"
Test-Endpoint -Method "POST" -Url "$baseUrl/tasks" `
    -Body @{
        title="Test Task"
        priority="high"
        status="pending"
        dueDate=(Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    } `
    -Description "Create New Task"

# Test 5: Clients Management
Write-Host "`n5. CLIENTS MANAGEMENT" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/clients" -Description "List All Clients"
Test-Endpoint -Method "POST" -Url "$baseUrl/clients" `
    -Body @{
        name="Test Client"
        nameAr="عميل تجريبي"
        email="testclient@example.com"
        phone="+966501234567"
        nationalId="1234567890"
    } `
    -Description "Create New Client"

# Test 6: AI Consultation
Write-Host "`n6. AI CONSULTATION SYSTEM" -ForegroundColor Magenta
$aiResponse = Test-Endpoint -Method "POST" -Url "$baseUrl/v1/ai/consultation" `
    -Body @{
        query="What are the requirements for company registration in Saudi Arabia?"
        context=@{type="corporate"; jurisdiction="saudi"}
        lawFirmId="default-firm"
    } `
    -Description "AI Legal Consultation"

# Test 7: RLHF System
Write-Host "`n7. RLHF FEEDBACK SYSTEM" -ForegroundColor Magenta
Test-Endpoint -Method "POST" -Url "$baseUrl/v1/rlhf/feedback" `
    -Body @{
        consultationId="test-consultation-123"
        rating=5
        feedback="Excellent response, very helpful"
        improvements=@{suggestion="Add more case examples"}
        lawyerId="lawyer-123"
    } `
    -Description "Submit RLHF Feedback"

Test-Endpoint -Method "GET" -Url "$baseUrl/v1/rlhf/analytics?lawFirmId=default-firm" `
    -Description "RLHF Analytics"

# Test 8: Invoices
Write-Host "`n8. INVOICE MANAGEMENT" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/invoices" -Description "List Invoices"
Test-Endpoint -Method "POST" -Url "$baseUrl/invoices" `
    -Body @{
        clientId="client-123"
        amount=5000
        currency="SAR"
        status="pending"
        items=@(@{description="Legal Service"; amount=5000; quantity=1})
    } `
    -Description "Create Invoice"

# Test 9: Employees
Write-Host "`n9. EMPLOYEE MANAGEMENT" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/employees" -Description "List Employees"
Test-Endpoint -Method "POST" -Url "$baseUrl/employees" `
    -Body @{
        name="Test Employee"
        nameAr="موظف تجريبي"
        email="employee@example.com"
        role="lawyer"
        department="legal"
    } `
    -Description "Create Employee"

# Test 10: Appointments
Write-Host "`n10. APPOINTMENT MANAGEMENT" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/appointments" -Description "List Appointments"
Test-Endpoint -Method "POST" -Url "$baseUrl/appointments" `
    -Body @{
        title="Client Meeting"
        clientId="client-123"
        date=(Get-Date).AddDays(1).ToString("yyyy-MM-dd")
        time="14:00"
        duration=60
    } `
    -Description "Create Appointment"

# Test 11: Documents
Write-Host "`n11. DOCUMENT MANAGEMENT" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/documents" -Description "List Documents"

# Test 12: Sessions
Write-Host "`n12. COURT SESSIONS" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/sessions" -Description "List Sessions"

# Test 13: Payments
Write-Host "`n13. PAYMENT MANAGEMENT" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/payments" -Description "List Payments"

# Test 14: Expenses
Write-Host "`n14. EXPENSE TRACKING" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/expenses" -Description "List Expenses"

# Test 15: Legal Library
Write-Host "`n15. LEGAL LIBRARY" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/legal-library" -Description "List Legal Resources"

# Final Report
Write-Host "`n`n========================================" -ForegroundColor Yellow
Write-Host "          TEST RESULTS SUMMARY" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

$totalTests = $testResults.Passed + $testResults.Failed
$successRate = if ($totalTests -gt 0) { [math]::Round(($testResults.Passed / $totalTests) * 100, 2) } else { 0 }

Write-Host "`n📊 Overall Statistics:" -ForegroundColor Cyan
Write-Host "   Total Tests: $totalTests" -ForegroundColor White
Write-Host "   ✅ Passed: $($testResults.Passed)" -ForegroundColor Green
Write-Host "   ❌ Failed: $($testResults.Failed)" -ForegroundColor Red
Write-Host "   Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) {"Green"} elseif ($successRate -ge 60) {"Yellow"} else {"Red"})

if ($testResults.Failed -gt 0) {
    Write-Host "`n❌ Failed Tests:" -ForegroundColor Red
    foreach ($error in $testResults.Errors) {
        Write-Host "   • $($error.Test)" -ForegroundColor Yellow
        Write-Host "     $($error.Error)" -ForegroundColor Gray
    }
}

# Deployment Readiness
Write-Host "`n`n========================================" -ForegroundColor Magenta
Write-Host "       DEPLOYMENT READINESS CHECK" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$deploymentReady = $true
$issues = @()

if ($testResults.Failed -gt 0) {
    $deploymentReady = $false
    $issues += "Some API endpoints failed"
}

if ($successRate -lt 80) {
    $deploymentReady = $false
    $issues += "Success rate below 80%"
}

if (-not $token) {
    $deploymentReady = $false
    $issues += "Authentication not working"
}

if ($deploymentReady) {
    Write-Host "`n✅ SYSTEM IS READY FOR DEPLOYMENT!" -ForegroundColor Green
    Write-Host "   All critical tests passed" -ForegroundColor Green
    Write-Host "   Authentication working" -ForegroundColor Green
    Write-Host "   AI system operational" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ SYSTEM NOT READY FOR DEPLOYMENT" -ForegroundColor Red
    Write-Host "`n   Issues to fix:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "   • $issue" -ForegroundColor Red
    }
}

Write-Host "`n========================================`n" -ForegroundColor Yellow

# Save results to file
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$reportPath = "test-results-$timestamp.json"
$testResults | ConvertTo-Json -Depth 10 | Out-File $reportPath
Write-Host "📄 Test results saved to: $reportPath" -ForegroundColor Cyan
