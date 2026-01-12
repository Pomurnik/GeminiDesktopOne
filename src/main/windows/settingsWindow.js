import { BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRELOAD_PATH = path.join(__dirname, '..', '..', 'preload', 'index.cjs');
const RENDERER_HTML = path.join(__dirname, '..', '..', 'renderer', 'settings', 'index.html');
const ICON_PATH = path.join(__dirname, '..', '..', '..', 'assets', 'icon.png');

let settingsWindow = null;

export function getSettingsWindow() {
    return settingsWindow;
}

export function createSettingsWindow(mainWindow) {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.focus();
        return settingsWindow;
    }

    settingsWindow = new BrowserWindow({
        width: 500,
        height: 600,
        parent: mainWindow,
        modal: false,
        frame: false,
        resizable: false,
        show: false,
        skipTaskbar: true,
        icon: ICON_PATH,
        title: 'Settings',
        webPreferences: {
            preload: PRELOAD_PATH,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            spellcheck: false
        }
    });

    settingsWindow.loadFile(RENDERER_HTML);

    settingsWindow.once('ready-to-show', () => {
        settingsWindow.show();
    });

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });

    return settingsWindow;
}
