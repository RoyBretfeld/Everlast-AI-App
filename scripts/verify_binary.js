#!/usr/bin/env node
/**
 * EVERLAST AI - Electron Binary Verification
 * RB-Protokoll §1: Transparenz
 *
 * Prueft ob die Electron-Binary korrekt installiert ist
 * und die nativen APIs verfuegbar sind.
 *
 * Usage: node scripts/verify_binary.js
 *        ODER: npx electron scripts/verify_binary.js
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const EXPECTED_VERSION = '40'; // Major version
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('=== Electron Binary Verification ===\n');

// Check 1: Package version
const pkgPath = path.join(PROJECT_ROOT, 'node_modules/electron/package.json');
if (!fs.existsSync(pkgPath)) {
    console.log('[FAIL] node_modules/electron nicht gefunden');
    process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
console.log(`[INFO] Package Version: ${pkg.version}`);

// Check 2: Binary exists
const pathFile = path.join(PROJECT_ROOT, 'node_modules/electron/path.txt');
const binaryName = fs.existsSync(pathFile)
    ? fs.readFileSync(pathFile, 'utf-8').trim()
    : 'electron.exe';
const binaryPath = path.join(PROJECT_ROOT, 'node_modules/electron/dist', binaryName);

if (!fs.existsSync(binaryPath)) {
    console.log(`[FAIL] Binary nicht gefunden: ${binaryPath}`);
    process.exit(1);
}
console.log(`[INFO] Binary gefunden: ${binaryName}`);

// Check 3: Binary version
try {
    const binaryVersion = execSync(`"${binaryPath}" --version`, { encoding: 'utf-8' }).trim();
    console.log(`[INFO] Binary Version: ${binaryVersion}`);

    const majorVersion = binaryVersion.replace('v', '').split('.')[0];
    if (majorVersion !== EXPECTED_VERSION) {
        console.log(`[WARN] Version Mismatch! Erwartet: v${EXPECTED_VERSION}.x.x`);
    }
} catch (err) {
    console.log(`[FAIL] Konnte Binary-Version nicht lesen: ${err.message}`);
    process.exit(1);
}

// Check 4: API availability (most critical)
console.log('\n[TEST] Pruefe Electron API Verfuegbarkeit...');
try {
    const testResult = execSync(
        `"${binaryPath}" -e "const e = require('electron'); console.log(JSON.stringify({app: typeof e.app, BrowserWindow: typeof e.BrowserWindow, globalShortcut: typeof e.globalShortcut}))"`,
        { encoding: 'utf-8', timeout: 10000 }
    ).trim();

    const apis = JSON.parse(testResult);
    console.log(`       app: ${apis.app}`);
    console.log(`       BrowserWindow: ${apis.BrowserWindow}`);
    console.log(`       globalShortcut: ${apis.globalShortcut}`);

    if (apis.app === 'undefined' || apis.BrowserWindow === 'undefined') {
        console.log('\n[FAIL] Kritische APIs sind undefined!');
        console.log('       Die Electron-Binary ist beschaedigt oder inkompatibel.');
        console.log('       Fuehre scripts/fix_electron_env.ps1 aus.');
        process.exit(1);
    }

    console.log('\n[PASS] Alle kritischen APIs verfuegbar!');
    process.exit(0);

} catch (err) {
    console.log(`[FAIL] API-Test fehlgeschlagen: ${err.message}`);
    process.exit(1);
}
