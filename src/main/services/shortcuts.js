import { globalShortcut, BrowserWindow, app } from 'electron';
import store from '../config/store.js';
import { getSettingsWindow } from '../windows/settingsWindow.js';

export function registerGlobalShortcuts(mainWindowInput, createSettingsWindow) {
    globalShortcut.unregisterAll();

    const hotkey = store.get('hotkey');

    try {
        const success = globalShortcut.register(hotkey, () => {
            console.log(`[Shortcuts] *** HOTKEY TRIGGERED: ${hotkey} ***`);
            const allWindows = BrowserWindow.getAllWindows();
            const userWindows = allWindows.filter(w => !w.__internal && !w.isDestroyed());

            if (userWindows.length === 0) {
                console.log('[Shortcuts] Action: SHOWING settings window');

                return;
            }

            const shouldShow = userWindows.some(win => !win.isVisible());

            userWindows.forEach(win => {
                if (shouldShow) {
                    console.log('[Shortcuts] Action: SHOWING window');
                    if (win.isMinimized()) win.restore();
                    win.show();

                    const settingsWindow = getSettingsWindow();
                    if (settingsWindow && !settingsWindow.isDestroyed()) {
                        settingsWindow.show();
                    }

                    // Standard Focus Logic
                    win.setAlwaysOnTop(true, 'screen-saver');
                    win.show();
                    if (typeof win.moveTop === 'function') win.moveTop();
                    win.focus();

                    setTimeout(() => {
                        if (win && !win.isDestroyed()) {
                            const alwaysOnTopPref = store.get('alwaysOnTop');
                            win.setAlwaysOnTop(alwaysOnTopPref, alwaysOnTopPref ? 'screen-saver' : 'normal');

                            // Prioritize settings window focus if open
                            if (settingsWindow && !settingsWindow.isDestroyed() && settingsWindow.isVisible()) {
                                settingsWindow.focus();
                            } else {
                                win.focus();
                                // Focus the actual web content (WebContentsView logic)
                                const view = win.contentView ? win.contentView.children[0] : null;
                                if (view && view.webContents && !view.webContents.isDestroyed()) {
                                    view.webContents.focus();
                                }
                            }
                        }
                    }, 300);
                } else {
                    console.log('[Shortcuts] Action: HIDING window');
                    win.hide();
                    const settingsWindow = getSettingsWindow();
                    if (settingsWindow && !settingsWindow.isDestroyed() && settingsWindow.isVisible()) {
                        settingsWindow.hide();
                    }
                }
            });
        });

        console.log(`[Shortcuts] Hotkey ${hotkey} registered: ${success ? 'SUCCESS' : 'FAILED'}`);

        if (!success) {
            console.error(`[Shortcuts] FAILED to register hotkey: ${hotkey}`);
        }
    } catch (e) {
        console.error('[Shortcuts] Exception:', e);
    }

    // Settings shortcut
    globalShortcut.register('Control+,', () => {
        if (createSettingsWindow) createSettingsWindow();
    });
}
