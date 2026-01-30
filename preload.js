const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onHotkey: (callback) => ipcRenderer.on('hotkey-triggered', callback),
    minimizeApp: () => ipcRenderer.send('minimize-app'),
});
