import { BrowserWindow, WebContentsView, app, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import store from '../config/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRELOAD_PATH = path.join(__dirname, '..', '..', 'preload', 'index.cjs');
const RENDERER_HTML = path.join(__dirname, '..', '..', 'renderer', 'app', 'index.html');
const ICON_PATH = path.join(__dirname, '..', '..', '..', 'assets', 'icon.png');

const SESSION_PARTITION = 'persist:gemini-app';
const GEMINI_URL = 'https://gemini.google.com/app';

let mainWindow = null;
let geminiView = null;

export function getMainWindow() {
    return mainWindow;
}

export function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 650,
        minHeight: 300,
        minWidth: 400,
        show: false,
        alwaysOnTop: store.get('alwaysOnTop'),
        title: 'GeminiDesktopOne',
        icon: ICON_PATH,
        frame: false,
        backgroundColor: '#131314',
        focusable: true,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: PRELOAD_PATH,
            sandbox: false
        }
    });

    if (store.get('alwaysOnTop')) {
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }

    mainWindow.loadFile(RENDERER_HTML);

    // Modern WebContentsView (Electron 30+)
    geminiView = new WebContentsView({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            partition: SESSION_PARTITION
        }
    });

    mainWindow.contentView.addChildView(geminiView);
    geminiView.setBackgroundColor('#131314');

    const setBounds = () => {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        const bounds = mainWindow.getContentBounds();
        geminiView.setBounds({
            x: 0,
            y: 32,
            width: bounds.width,
            height: bounds.height - 32
        });
    };

    mainWindow.on('resize', setBounds);
    mainWindow.on('maximize', setBounds);
    mainWindow.on('unmaximize', setBounds);

    let viewReady = false;
    let mainReady = false;

    const showIfReady = () => {
        if (viewReady && mainReady) {
            setBounds();
            if (!store.get('startMinimized')) {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    };

    geminiView.webContents.once('dom-ready', () => {
        viewReady = true;
        showIfReady();
    });

    mainWindow.once('ready-to-show', () => {
        mainReady = true;
        showIfReady();
    });

    // Fallback if ready-to-show doesn't fire
    setTimeout(() => {
        if (mainWindow && !mainWindow.isVisible()) {
            viewReady = true;
            showIfReady();
        }
    }, 4000);

    geminiView.webContents.loadURL(GEMINI_URL);

    mainWindow.on('close', (event) => {
        if (!app.isQuitting && !store.get('quitOnClose')) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });

    applyInvisibilityMode(mainWindow);

    return mainWindow;
}

export function applyInvisibilityMode(win) {
    if (!win || win.isDestroyed()) return;
    const enabled = store.get('invisibilityMode');
    try {
        win.setContentProtection(enabled);
        // If enabled, force skip taskbar. If disabled, restore based on other settings logic (usually false for main window)
        // But for Main Window, usually we want it in taskbar unless minimized to tray or strictly hidden.
        // Assuming normal behavior is "in taskbar".
        win.setSkipTaskbar(enabled);
        console.log(`Invisibility mode ${enabled ? 'enabled' : 'disabled'} for window ${win.id}`);
    } catch (e) {
        console.warn('Failed to set content protection:', e);
    }
}
