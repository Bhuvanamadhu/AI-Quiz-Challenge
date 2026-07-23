# ==========================================================
# AUTOMATIC SETUP SCRIPT FOR AI QUIZ CHALLENGE
# ==========================================================

$ErrorActionPreference = "Stop"
$WorkspaceDir = $PSScriptRoot
if ([string]::IsNullOrEmpty($WorkspaceDir)) {
    $WorkspaceDir = Get-Location
}

Write-Host "=========================================================="
Write-Host "INITIALIZING AUTOMATIC DEPENDENCY SETUP..."
Write-Host "=========================================================="

# 1. CHECK/DOWNLOAD PORTABLE NODE.JS
$NodeDir = Join-Path $WorkspaceDir "node-env"
$NodeExe = Join-Path $NodeDir "node.exe"
$NpmCmd = Join-Path $NodeDir "npm.cmd"

if (!(Test-Path $NodeExe)) {
    Write-Host "Node.js not detected in workspace. Downloading portable Node.js..."
    
    # Official Node.js Win-x64 zip URL (LTS v20.11.1)
    $NodeUrl = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip"
    $ZipPath = Join-Path $WorkspaceDir "node-temp.zip"
    $TempExtract = Join-Path $WorkspaceDir "node-temp-extract"

    Write-Host "Downloading zip package (approx. 30MB) from official Node.js CDN..."
    Invoke-WebRequest -Uri $NodeUrl -OutFile $ZipPath -UseBasicParsing
    
    Write-Host "Extracting files..."
    if (Test-Path $TempExtract) { Remove-Item $TempExtract -Recurse -Force }
    New-Item -ItemType Directory -Path $TempExtract | Out-Null
    
    Expand-Archive -Path $ZipPath -DestinationPath $TempExtract -Force
    
    # Move inner directory contents directly to node-env
    $InnerDir = Get-ChildItem $TempExtract | Select-Object -First 1
    if (Test-Path $NodeDir) { Remove-Item $NodeDir -Recurse -Force }
    Move-Item -Path $InnerDir.FullName -Destination $NodeDir -Force
    
    # Clean up temp files
    Remove-Item $ZipPath -Force
    Remove-Item $TempExtract -Recurse -Force
    Write-Host "Portable Node.js environment configured locally."
} else {
    Write-Host "Local Node.js environment detected."
}

# Add local Node.js binary path to current PowerShell environment path
$env:Path = "$NodeDir;" + $env:Path

# Verify installation works
$NodeVersion = & $NodeExe -v
Write-Host "Active Node Version: $NodeVersion"

# 2. INSTALL BACKEND DEPENDENCIES
Write-Host "Installing backend packages..."
$BackendDir = Join-Path $WorkspaceDir "backend"

Push-Location $BackendDir
try {
    # Run npm install using local binary
    & $NpmCmd install
    Write-Host "Dependencies installed successfully."
} finally {
    Pop-Location
}

# 3. SEED SQLITE DATABASE
Write-Host "Seeding SQLite database with 1050 questions..."
$SeederPath = Join-Path $BackendDir "scripts/seed.js"

try {
    & $NodeExe $SeederPath
    Write-Host "SQLite Database successfully initialized and seeded."
} catch {
    Write-Host "Database seeding failed: $_"
    exit 1
}

Write-Host "=========================================================="
Write-Host "SETUP COMPLETED SUCCESSFULLY!"
Write-Host "The application is now fully configured and seeded."
Write-Host "To run the application:"
Write-Host "Run run.ps1 or double-click run.bat in the project root."
Write-Host "=========================================================="
