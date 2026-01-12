import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assets path logic: we need to go up from src/main/services to root/assets
// Current: src/main/services/tray.js -> ../../../assets
const ASSETS_PATH = path.join(__dirname, '..', '..', '..', 'assets');

let tray = null;

export function createTray(mainWindow) {
    const iconPath = path.join(ASSETS_PATH, 'icon.png');
    const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

    tray = new Tray(icon);
    tray.setToolTip('GeminiDesktopOne');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Gemini', click: () => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit', click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });

    return tray;
}
