# Kill any existing node processes on port 5000, then restart cleanly
$NodeDir = Join-Path $PSScriptRoot "node-env"
$NodeExe = Join-Path $NodeDir "node.exe"

if (!(Test-Path $NodeExe)) {
    # Fall back to system node if portable one not found
    $NodeExe = "node"
}

# Kill old server if running on port 5000
$proc = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($proc) {
    Write-Host "Stopping existing server (PID: $proc)..."
    Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

Write-Host "Starting AI Quiz Challenge backend..."
$env:Path = "$NodeDir;$env:Path"

$serverScript = Join-Path $PSScriptRoot "backend\server.js"
$job = Start-Job -ScriptBlock {
    param($exe, $script)
    & $exe $script 2>&1
} -ArgumentList $NodeExe, $serverScript

Write-Host "Server starting (Job ID: $($job.Id))..."
Start-Sleep -Seconds 3

# Verify it's running
$check = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($check) {
    Write-Host "[OK] Server is running on port 5000" -ForegroundColor Green
    Write-Host "[OK] Open: http://localhost:5000" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Server failed to start. Checking logs:" -ForegroundColor Red
    Receive-Job -Id $job.Id
}

# Keep alive
try {
    while ($true) { Start-Sleep -Seconds 2 }
} finally {
    Stop-Job $job; Remove-Job $job -Force
    Write-Host "Server stopped."
}
