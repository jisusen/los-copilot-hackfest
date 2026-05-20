# Credit Analyst Copilot — Demo Startup Script
# Usage: .\start-demo.ps1
#
# This script:
# 1. Resets the LOS database (all apps → Loan Underwriting)
# 2. Starts both LOS Demo (port 3333) and Dashboard (port 3003) servers
#    using concurrently for clean multiplexed output and unified shutdown.

$ErrorActionPreference = "Stop"

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$LOS_PORT = 3333
$DASH_PORT = 3003

function Test-Port($port) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $port)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

function Stop-ProcessOnPort($port) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        if ($conn.OwningProcess -gt 0) {
            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "  Stopping $($proc.Name) (PID: $($proc.Id)) on port $port..." -ForegroundColor Yellow
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Credit Analyst Copilot — Hackathon Demo Starter" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Free ports if occupied
if (Test-Port $LOS_PORT) {
    Write-Host "⚠ Port $LOS_PORT in use. Releasing..." -ForegroundColor Yellow
    Stop-ProcessOnPort $LOS_PORT
    Start-Sleep -Seconds 1
}
if (Test-Port $DASH_PORT) {
    Write-Host "⚠ Port $DASH_PORT in use. Releasing..." -ForegroundColor Yellow
    Stop-ProcessOnPort $DASH_PORT
    Start-Sleep -Seconds 1
}

# Step 1: Reset database
Write-Host "📦 Resetting LOS database..." -ForegroundColor Green
Set-Location $ROOT
bun run server/db/seed.ts --reset
Write-Host "✅ Database reset complete." -ForegroundColor Green
Write-Host ""

# Step 2: Start both servers with concurrently
Write-Host "🚀 Starting LOS Demo (:$LOS_PORT) and Dashboard (:$DASH_PORT)..." -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop both servers." -ForegroundColor DarkGray
Write-Host ""

Set-Location $ROOT
try {
    bun run demo
} finally {
    Write-Host ""
    Write-Host "🛑 Servers stopped." -ForegroundColor Yellow
}
