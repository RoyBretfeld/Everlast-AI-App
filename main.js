const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 400,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // In development, load from Next.js dev server
    const startUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '.next/server/app/index.html')}`;

    mainWindow.loadURL(startUrl);

    // Default behavior: hidden, shown on hotkey
    mainWindow.hide();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    // Register Global Hotkey (Alt+Shift+E as a placeholder)
    const ret = globalShortcut.register('Alt+Shift+E', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
                // Notify frontend to start/stop session
                mainWindow.webContents.send('hotkey-triggered');
            }
        }
    });

    if (!ret) {
        console.log('registration failed');
    }

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

// IPC communication
ipcMain.on('minimize-app', () => {
    mainWindow.hide();
});
