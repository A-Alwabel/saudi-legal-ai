# Comprehensive System Test Script for Saudi Legal AI v2
# This script tests ALL features, APIs, and integrations

$global:testResults = @{
    Passed = 0
    Failed = 0
    Errors = @()
}

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [string]$Description
    )
    
    Write-Host "`nTesting: $Description" -ForegroundColor Cyan
    Write-Host "  $Method $Url" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
            "Accept-Language" = "en"
        }
        
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✅ SUCCESS" -ForegroundColor Green
        $global:testResults.Passed++
        return $response
    } catch {
        Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $global:testResults.Failed++
        $global:testResults.Errors += @{
            Test = $Description
            Error = $_.Exception.Message
        }
        return $null
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  SAUDI LEGAL AI v2 - SYSTEM TEST" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# 1. Test Backend Health
Write-Host "`n📡 BACKEND & DATABASE TESTS" -ForegroundColor Magenta
Write-Host "============================" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/health" -Description "Backend Health Check"

# 2. Test Authentication
Write-Host "`n🔐 AUTHENTICATION TESTS" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor Magenta

$loginResponse = Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/auth/login" `
    -Body @{email="admin@saudilegal.ai"; password="Admin123!"} `
    -Description "Admin Login"

if ($loginResponse -and $loginResponse.token) {
    $token = $loginResponse.token
    Write-Host "  Token received: $($token.Substring(0, 20))..." -ForegroundColor Gray
} else {
    $token = $null
}

Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/auth/register" `
    -Body @{email="test@example.com"; password="Test123!"; name="Test User"; firmId="test-firm"} `
    -Description "User Registration"

# 3. Test Case Management
Write-Host "`n⚖️ CASE MANAGEMENT TESTS" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/cases" -Description "Get All Cases"
Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/cases" `
    -Body @{title="Test Case"; clientId="client-1"; type="civil"; status="active"} `
    -Description "Create New Case"

# 4. Test Task Management
Write-Host "`n✅ TASK MANAGEMENT TESTS" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/tasks" -Description "Get All Tasks"
Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/tasks" `
    -Body @{title="Test Task"; priority="high"; status="pending"} `
    -Description "Create New Task"

# 5. Test Client Management
Write-Host "`n👥 CLIENT MANAGEMENT TESTS" -ForegroundColor Magenta
Write-Host "===========================" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/clients" -Description "Get All Clients"
Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/clients" `
    -Body @{name="Test Client"; email="client@test.com"; phone="+966501234567"} `
    -Description "Create New Client"

# 6. Test Employee Management
Write-Host "`n👔 EMPLOYEE MANAGEMENT TESTS" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/employees" -Description "Get All Employees"
Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/employees" `
    -Body @{name="Test Employee"; email="employee@test.com"; role="lawyer"; department="legal"} `
    -Description "Create New Employee"

# 7. Test Invoice Management
Write-Host "`n💰 INVOICE MANAGEMENT TESTS" -ForegroundColor Magenta
Write-Host "============================" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/invoices" -Description "Get All Invoices"
Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/invoices" `
    -Body @{clientId="client-1"; amount=5000; status="pending"; items=@(@{description="Legal Service"; amount=5000})} `
    -Description "Create New Invoice"

# 8. Test AI System
Write-Host "`n🤖 AI SYSTEM TESTS" -ForegroundColor Magenta
Write-Host "===================" -ForegroundColor Magenta

Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/v1/ai/consultation" `
    -Body @{
        query="What are the requirements for company registration in Saudi Arabia?"
        context=@{type="corporate"; jurisdiction="saudi"}
        lawFirmId="default-firm"
    } `
    -Description "AI Legal Consultation"

Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/v1/rlhf/feedback" `
    -Body @{
        consultationId="test-consultation"
        rating=5
        feedback="Accurate and helpful"
        improvements=@{suggestion="Add more details"}
        lawyerId="lawyer-1"
    } `
    -Description "RLHF Feedback Submission"

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/v1/rlhf/analytics?lawFirmId=default-firm" `
    -Description "RLHF Analytics"

# 9. Test Appointments
Write-Host "`n📅 APPOINTMENT TESTS" -ForegroundColor Magenta
Write-Host "=====================" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/appointments" -Description "Get All Appointments"
Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/appointments" `
    -Body @{
        title="Client Meeting"
        clientId="client-1"
        date=(Get-Date).AddDays(1).ToString("yyyy-MM-dd")
        time="14:00"
    } `
    -Description "Create New Appointment"

# 10. Test Sessions
Write-Host "`n⚖️ COURT SESSION TESTS" -ForegroundColor Magenta
Write-Host "=======================" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/sessions" -Description "Get All Sessions"
Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/sessions" `
    -Body @{
        caseId="case-1"
        date=(Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        court="Riyadh Court"
        type="hearing"
    } `
    -Description "Create New Session"

# 11. Test Documents
Write-Host "`n📄 DOCUMENT TESTS" -ForegroundColor Magenta
Write-Host "==================" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/documents" -Description "Get All Documents"
Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/documents" `
    -Body @{
        title="Legal Contract"
        type="contract"
        caseId="case-1"
        content="Sample document content"
    } `
    -Description "Create New Document"

# 12. Test Legal Library
Write-Host "`n📚 LEGAL LIBRARY TESTS" -ForegroundColor Magenta
Write-Host "=======================" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/legal-library" -Description "Get Legal Resources"
Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/legal-library/laws" -Description "Get Saudi Laws"

# 13. Test Reports
Write-Host "`n📊 REPORTS TESTS" -ForegroundColor Magenta
Write-Host "=================" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/reports/financial" -Description "Financial Reports"
Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/reports/cases" -Description "Case Reports"

# 14. Test Notifications
Write-Host "`n🔔 NOTIFICATION TESTS" -ForegroundColor Magenta
Write-Host "======================" -ForegroundColor Magenta

Test-Endpoint -Method "GET" -Url "http://localhost:5000/api/notifications" -Description "Get Notifications"

# 15. Test Client Portal
Write-Host "`n🌐 CLIENT PORTAL TESTS" -ForegroundColor Magenta
Write-Host "=======================" -ForegroundColor Magenta

Test-Endpoint -Method "POST" -Url "http://localhost:5000/api/client-portal/login" `
    -Body @{email="client@example.com"; password="Client123!"} `
    -Description "Client Portal Login"

# Final Report
Write-Host "`n`n========================================" -ForegroundColor Yellow
Write-Host "          TEST RESULTS SUMMARY" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

$totalTests = $global:testResults.Passed + $global:testResults.Failed
$successRate = if ($totalTests -gt 0) { [math]::Round(($global:testResults.Passed / $totalTests) * 100, 2) } else { 0 }

Write-Host "`n📊 Overall Statistics:" -ForegroundColor Cyan
Write-Host "   Total Tests: $totalTests" -ForegroundColor White
Write-Host "   ✅ Passed: $($global:testResults.Passed)" -ForegroundColor Green
Write-Host "   ❌ Failed: $($global:testResults.Failed)" -ForegroundColor Red
Write-Host "   Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) {"Green"} elseif ($successRate -ge 60) {"Yellow"} else {"Red"})

if ($global:testResults.Failed -gt 0) {
    Write-Host "`n❌ Failed Tests:" -ForegroundColor Red
    foreach ($error in $global:testResults.Errors) {
        Write-Host "   • $($error.Test)" -ForegroundColor Yellow
        Write-Host "     Error: $($error.Error)" -ForegroundColor Gray
    }
}

# Deployment Readiness Check
Write-Host "`n`n========================================" -ForegroundColor Magenta
Write-Host "       DEPLOYMENT READINESS CHECK" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$deploymentReady = $true
$issues = @()

# Check critical components
if ($global:testResults.Failed -gt 0) {
    $deploymentReady = $false
    $issues += "API endpoints have failures"
}

# Check success rate
if ($successRate -lt 80) {
    $deploymentReady = $false
    $issues += "Success rate below 80%"
}

if ($deploymentReady) {
    Write-Host "`n✅ SYSTEM IS READY FOR DEPLOYMENT!" -ForegroundColor Green
    Write-Host "   All critical tests passed" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ SYSTEM NOT READY FOR DEPLOYMENT" -ForegroundColor Red
    Write-Host "`n   Issues to fix:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "   • $issue" -ForegroundColor Red
    }
}

Write-Host "`n========================================`n" -ForegroundColor Yellow

