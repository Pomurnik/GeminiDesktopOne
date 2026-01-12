const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script initializing...');

contextBridge.exposeInMainWorld('electronAPI', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSetting: (key, value) => ipcRenderer.send('save-setting', key, value),
    closeSettings: () => ipcRenderer.send('close-settings'),
    openSettings: () => ipcRenderer.send('open-settings'),
    windowControl: (action) => ipcRenderer.send('window-control', action),
    onSettingsUpdate: (callback) => ipcRenderer.on('settings-updated', (event, settings) => callback(settings)),
    openExternalLogin: () => ipcRenderer.send('open-external-login'),
});

console.log('Preload script: electronAPI exposed to window');
