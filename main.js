const path = require('path');

let app, BrowserWindow, globalShortcut, ipcMain;

try {
  const electronModule = require('electron');
  if (electronModule && typeof electronModule === 'object' && electronModule.app) {
    ({ app, BrowserWindow, globalShortcut, ipcMain } = electronModule);
  }
} catch (e) {
  console.log('Electron error:', e.message);
}

if (!app) {
  console.error('Electron not available');
  process.exit(1);
}

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    show: true,  // Fenster sofort anzeigen
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.show();

  // Versuche zu laden
  mainWindow.loadURL('http://localhost:3000')
    .catch(() => mainWindow.loadURL('http://localhost:3001'))
    .catch(() => mainWindow.loadURL('about:blank'));

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit(); // Beendet den gesamten Prozess, wenn das Fenster geschlossen wird
  });
};

app.on('ready', () => {
  createWindow();

  // Registriere die Hotkey - startet nur die Aufnahme
  const ret = globalShortcut.register('Ctrl+Alt+E', () => {
    console.log('Hotkey triggered: Ctrl+Alt+E - Starting recording');
    if (mainWindow) {
      mainWindow.webContents.send('hotkey-triggered');
    }
  });

  // Überprüfe, ob die Hotkey erfolgreich registriert wurde
  if (ret) {
    console.log('✓ Hotkey Ctrl+Alt+E erfolgreich registriert');
  } else {
    console.error('✗ Fehler beim Registrieren der Hotkey Ctrl+Alt+E');
    console.log('Die Hotkey könnte bereits von einer anderen Anwendung verwendet werden.');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.on('minimize-app', () => {
  if (mainWindow) mainWindow.hide();
});
