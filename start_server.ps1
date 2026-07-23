# Kill process on port 5000 and restart server
$connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $procId = $conn.OwningProcess
        Write-Host "Killing process $procId on port 5000..."
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "Port 5000 cleared."
}
else {
    Write-Host "Port 5000 is free."
}

# Now start server
$nodeExe = Join-Path $PSScriptRoot "node-env\node.exe"
$serverJs = Join-Path $PSScriptRoot "backend\server.js"

if (!(Test-Path $nodeExe)) {
    Write-Host "node-env not found, using system node..."
    $nodeExe = "node"
}

Write-Host "Starting AI Quiz Challenge server..."
& $nodeExe $serverJs
