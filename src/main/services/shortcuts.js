import { globalShortcut, BrowserWindow } from 'electron';
import store from '../config/store.js';

export function registerGlobalShortcuts(mainWindow, createSettingsWindow) {
    globalShortcut.unregisterAll();

    try {
        globalShortcut.register(store.get('hotkey'), () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                if (mainWindow.isVisible()) {
                    mainWindow.hide();
                } else {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        });
    } catch (e) {
        console.error('Hotkey registration failed:', e);
    }

    // Ctrl+, for settings
    globalShortcut.register('Control+,', () => {
        if (createSettingsWindow) createSettingsWindow();
    });
}
