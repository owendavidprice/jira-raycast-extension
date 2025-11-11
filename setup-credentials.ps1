# Jira Extension Credentials Setup Script
# This script helps you set up environment variables as a fallback for Raycast preferences

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Jira for Windows - Credentials Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you configure your Jira credentials as environment variables." -ForegroundColor Yellow
Write-Host "This is a workaround for Raycast Windows preferences not persisting." -ForegroundColor Yellow
Write-Host ""

# Function to read secure input
function Read-SecureInput {
    param([string]$Prompt)
    Write-Host "$Prompt" -NoNewline -ForegroundColor Green
    $secure = Read-Host -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $value = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    return $value
}

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Note: Not running as Administrator. Variables will be set for current user only." -ForegroundColor Yellow
    Write-Host ""
}

# Get credentials from user
Write-Host "Enter your Jira credentials:" -ForegroundColor Cyan
Write-Host ""

$jiraDomain = Read-Host "Jira Domain (e.g., yourcompany.atlassian.net)"
$email = Read-Host "Email"
$apiToken = Read-SecureInput "API Token (hidden)"
$defaultProject = Read-Host "Default Project (optional, press Enter to skip)"

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Cyan

try {
    # Set environment variables for current user
    [Environment]::SetEnvironmentVariable("JIRA_DOMAIN", $jiraDomain, "User")
    [Environment]::SetEnvironmentVariable("JIRA_EMAIL", $email, "User")
    [Environment]::SetEnvironmentVariable("JIRA_API_TOKEN", $apiToken, "User")
    
    if ($defaultProject) {
        [Environment]::SetEnvironmentVariable("JIRA_DEFAULT_PROJECT", $defaultProject, "User")
    }
    
    Write-Host ""
    Write-Host "✓ Environment variables set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configured:" -ForegroundColor Cyan
    Write-Host "  JIRA_DOMAIN: $jiraDomain" -ForegroundColor White
    Write-Host "  JIRA_EMAIL: $email" -ForegroundColor White
    Write-Host "  JIRA_API_TOKEN: ********" -ForegroundColor White
    if ($defaultProject) {
        Write-Host "  JIRA_DEFAULT_PROJECT: $defaultProject" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "IMPORTANT: You must restart Raycast for changes to take effect!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Close Raycast completely (Right-click → Quit)" -ForegroundColor White
    Write-Host "2. Reopen Raycast" -ForegroundColor White
    Write-Host "3. Try running a Jira command" -ForegroundColor White
    Write-Host ""
    
    $restart = Read-Host "Would you like to kill Raycast now? (y/n)"
    if ($restart -eq "y" -or $restart -eq "Y") {
        Write-Host "Closing Raycast..." -ForegroundColor Yellow
        Get-Process -Name "Raycast" -ErrorAction SilentlyContinue | Stop-Process -Force
        Write-Host "Raycast closed. Please reopen it manually." -ForegroundColor Green
    }
    
} catch {
    Write-Host ""
    Write-Host "✗ Error setting environment variables:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "You may need to run this script as Administrator." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""

# Optional: Show how to verify
Write-Host "To verify your settings, run:" -ForegroundColor Cyan
Write-Host '  $env:JIRA_DOMAIN' -ForegroundColor White
Write-Host '  $env:JIRA_EMAIL' -ForegroundColor White
Write-Host ""

