# ============================================
# EVERLAST AI - NUCLEAR ELECTRON CLEAN
# Architekten-Weisung: Fundament reparieren
# ============================================

Write-Host ""
Write-Host "=== NUCLEAR ELECTRON CLEAN ===" -ForegroundColor Red
Write-Host "Loesche ALLE Electron-Caches und Binaries" -ForegroundColor Yellow
Write-Host ""

# 1. LocalAppData Electron Cache
$paths = @(
    "$env:LOCALAPPDATA\electron",
    "$env:LOCALAPPDATA\electron-builder",
    "$env:APPDATA\electron",
    "$env:USERPROFILE\.electron",
    "$env:USERPROFILE\.cache\electron"
)

foreach ($p in $paths) {
    if (Test-Path $p) {
        Write-Host "[DEL] $p" -ForegroundColor Yellow
        Remove-Item -Recurse -Force $p -ErrorAction SilentlyContinue
    }
}

# 2. npm cache clean
Write-Host "[NPM] Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null

# 3. Project cleanup
$projectRoot = Split-Path -Parent $PSScriptRoot
Write-Host "[PRJ] Cleaning project: $projectRoot" -ForegroundColor Yellow

$toDelete = @(
    (Join-Path $projectRoot "node_modules"),
    (Join-Path $projectRoot "package-lock.json"),
    (Join-Path $projectRoot ".next")
)

foreach ($p in $toDelete) {
    if (Test-Path $p) {
        Write-Host "      Removing: $p" -ForegroundColor Gray
        Remove-Item -Recurse -Force $p -ErrorAction SilentlyContinue
    }
}

# 4. Fresh install
Write-Host ""
Write-Host "[NPM] Running npm install..." -ForegroundColor Cyan
Set-Location $projectRoot
npm install

# 5. Verify
Write-Host ""
Write-Host "=== VERIFICATION ===" -ForegroundColor Cyan

$electronExe = Join-Path $projectRoot "node_modules\electron\dist\electron.exe"
if (Test-Path $electronExe) {
    $version = & $electronExe --version 2>&1
    Write-Host "electron.exe --version: $version" -ForegroundColor White

    if ($version -match "v40") {
        Write-Host "[PASS] Correct version installed!" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Wrong version! Expected v40.x.x" -ForegroundColor Red
        Write-Host ""
        Write-Host "MANUAL FIX REQUIRED:" -ForegroundColor Yellow
        Write-Host "1. Close all terminals and IDEs"
        Write-Host "2. Reboot Windows"
        Write-Host "3. Run this script again"
    }
} else {
    Write-Host "[FAIL] electron.exe not found!" -ForegroundColor Red
}
