import { app, ipcMain, BrowserWindow } from 'electron';
import path from 'path';
import AutoLaunch from 'auto-launch';

// Config & Services
import store from './config/store.js';
import { createTray } from './services/tray.js';
import { registerGlobalShortcuts } from './services/shortcuts.js';

// Windows
import { createMainWindow, getMainWindow } from './windows/mainWindow.js';
import { createSettingsWindow, getSettingsWindow } from './windows/settingsWindow.js';

// CRITICAL: Hide Electron from Google's bot detection
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');

// Setup AutoLaunch
const geminiAutoLauncher = new AutoLaunch({
    name: 'GeminiDesktopOne',
    path: app.getPath('exe'),
});

// Deep Link Registration
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('gemini-desktop', process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient('gemini-desktop');
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine) => {
        const mainWindow = getMainWindow();
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }
    });
}

const initApp = () => {
    const mainWindow = createMainWindow();
    createTray(mainWindow);
    registerGlobalShortcuts(mainWindow, () => createSettingsWindow(mainWindow));

    // Handle AutoLaunch state
    const runAtStartup = store.get('runAtStartup');
    if (runAtStartup) {
        geminiAutoLauncher.enable().catch(err => console.error('Failed to enable auto-launch:', err));
    } else {
        geminiAutoLauncher.disable().catch(err => console.error('Failed to disable auto-launch:', err));
    }
};

app.whenReady().then(() => {
    initApp();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) initApp();
    });
});

// IPC: Settings
ipcMain.handle('get-settings', () => {
    return store.store;
});

ipcMain.on('save-setting', (event, key, value) => {
    console.log(`Saving setting: ${key} = ${value}`);
    store.set(key, value);

    const mainWindow = getMainWindow();

    if (key === 'alwaysOnTop' && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setAlwaysOnTop(value, value ? 'screen-saver' : 'normal');
    }

    if (key === 'hotkey') {
        registerGlobalShortcuts(mainWindow, () => createSettingsWindow(mainWindow));
    }

    if (key === 'runAtStartup') {
        if (value) {
            geminiAutoLauncher.enable().catch(err => console.error('Failed to enable auto-launch:', err));
        } else {
            geminiAutoLauncher.disable().catch(err => console.error('Failed to disable auto-launch:', err));
        }
    }

    // Broadcast update to all windows
    BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('settings-updated', store.store);
        }
    });
});

ipcMain.on('open-settings', () => {
    createSettingsWindow(getMainWindow());
});

// IPC: Window Control
ipcMain.on('window-control', (event, action) => {
    const mainWindow = getMainWindow();
    if (!mainWindow || mainWindow.isDestroyed()) return;

    if (action === 'minimize') mainWindow.minimize();
    if (action === 'maximize') mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
    if (action === 'close') {
        if (store.get('quitOnClose')) {
            app.isQuiting = true;
            app.quit();
        } else {
            mainWindow.hide();
        }
    }
});

ipcMain.on('close-settings', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        win.close();
    } else {
        const settingsWindow = getSettingsWindow();
        if (settingsWindow && !settingsWindow.isDestroyed()) {
            settingsWindow.close();
        }
    }
});
