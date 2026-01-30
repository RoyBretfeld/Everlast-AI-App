# ============================================
# EVERLAST AI - Electron Environment Fix
# RB-Protokoll: Cache-Purge (Destruktive Aktion)
# ============================================

Write-Host "=== EVERLAST Electron Environment Fix ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Purge Electron Cache
$electronCache = "$env:LOCALAPPDATA\electron"
if (Test-Path $electronCache) {
    Write-Host "[1/4] Loesche Electron Cache: $electronCache" -ForegroundColor Yellow
    Remove-Item -Recurse -Force $electronCache
    Write-Host "      Cache geloescht." -ForegroundColor Green
} else {
    Write-Host "[1/4] Electron Cache nicht gefunden (bereits sauber)." -ForegroundColor Green
}

# Step 2: Remove node_modules
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeModules = Join-Path $projectRoot "node_modules"
$packageLock = Join-Path $projectRoot "package-lock.json"

if (Test-Path $nodeModules) {
    Write-Host "[2/4] Loesche node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $nodeModules
    Write-Host "      node_modules geloescht." -ForegroundColor Green
}

if (Test-Path $packageLock) {
    Remove-Item -Force $packageLock
    Write-Host "      package-lock.json geloescht." -ForegroundColor Green
}

# Step 3: Reinstall
Write-Host "[3/4] Fuehre npm install aus..." -ForegroundColor Yellow
Set-Location $projectRoot
npm install
Write-Host "      npm install abgeschlossen." -ForegroundColor Green

# Step 4: Verify
Write-Host "[4/4] Verifiziere Electron Binary..." -ForegroundColor Yellow
$verifyScript = Join-Path $projectRoot "scripts\verify_binary.js"
if (Test-Path $verifyScript) {
    node $verifyScript
} else {
    Write-Host "      verify_binary.js nicht gefunden - ueberspringe." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Environment Fix abgeschlossen ===" -ForegroundColor Cyan
