import { BrowserWindow, BrowserView, app, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import store from '../config/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to src/main/windows/
// Preload: src/preload/index.cjs -> ../../preload/index.cjs
// Renderer: src/renderer/app/index.html -> ../../../renderer/app/index.html
// Assets: root/assets/icon.png -> ../../../assets/icon.png

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

    geminiView = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            partition: SESSION_PARTITION
        }
    });

    mainWindow.setBrowserView(geminiView);
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
        if (!app.isQuiting && !store.get('quitOnClose')) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });

    return mainWindow;
}
