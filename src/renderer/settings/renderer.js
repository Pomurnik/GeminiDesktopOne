(function () {
    const { electronAPI } = window;
    console.log('Settings renderer initializing...');

    const elements = {
        alwaysOnTop: document.getElementById('alwaysOnTop'),
        hotkey: document.getElementById('hotkey'),
        startMinimized: document.getElementById('startMinimized'),
        runAtStartup: document.getElementById('runAtStartup'),
        quitOnClose: document.getElementById('quitOnClose'),
        closeBtn: document.getElementById('closeBtn')
    };

    let isInitializing = false;
    let isRecordingHotkey = false;

    async function init() {
        if (!electronAPI) {
            console.error('electronAPI not found!');
            return;
        }

        isInitializing = true;
        try {
            console.log('Fetching settings from main process...');
            const settings = await electronAPI.getSettings();
            console.log('Settings received:', settings);

            if (elements.alwaysOnTop) elements.alwaysOnTop.checked = !!settings.alwaysOnTop;
            if (elements.hotkey) elements.hotkey.value = settings.hotkey || 'Control+Shift+G';
            if (elements.startMinimized) elements.startMinimized.checked = !!settings.startMinimized;
            if (elements.runAtStartup) elements.runAtStartup.checked = !!settings.runAtStartup;
            if (elements.quitOnClose) elements.quitOnClose.checked = !!settings.quitOnClose;
        } catch (err) {
            console.error('Error in settings init:', err);
        } finally {
            isInitializing = false;
        }
    }

    // Attach listeners
    if (elements.alwaysOnTop) {
        elements.alwaysOnTop.addEventListener('change', (e) => {
            if (isInitializing) return;
            electronAPI.saveSetting('alwaysOnTop', e.target.checked);
        });
    }

    if (elements.runAtStartup) {
        elements.runAtStartup.addEventListener('change', (e) => {
            if (isInitializing) return;
            electronAPI.saveSetting('runAtStartup', e.target.checked);
        });
    }

    if (elements.quitOnClose) {
        elements.quitOnClose.addEventListener('change', (e) => {
            if (isInitializing) return;
            console.log('Toggling quitOnClose:', e.target.checked);
            electronAPI.saveSetting('quitOnClose', e.target.checked);
        });
    }

    if (elements.startMinimized) {
        elements.startMinimized.addEventListener('change', (e) => {
            if (isInitializing) return;
            electronAPI.saveSetting('startMinimized', e.target.checked);
        });
    }

    // Robust Hotkey Recorder
    if (elements.hotkey) {
        elements.hotkey.addEventListener('click', () => {
            isRecordingHotkey = true;
            elements.hotkey.value = 'Recording...';
            elements.hotkey.classList.add('recording');
        });

        elements.hotkey.addEventListener('blur', () => {
            if (isRecordingHotkey) {
                isRecordingHotkey = false;
                elements.hotkey.classList.remove('recording');
                // Re-fetch current setting to restore previous value if aborted
                electronAPI.getSettings().then(s => {
                    elements.hotkey.value = s.hotkey;
                });
            }
        });

        elements.hotkey.addEventListener('keydown', (e) => {
            if (!isRecordingHotkey) return;
            e.preventDefault();

            if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

            const modifiers = [];
            if (e.ctrlKey) modifiers.push('Control');
            if (e.shiftKey) modifiers.push('Shift');
            if (e.altKey) modifiers.push('Alt');
            if (e.metaKey) modifiers.push('Meta');

            if (modifiers.length > 0) {
                const key = e.key.toUpperCase();
                // Fix for special characters or function keys
                const finalKey = (key.length === 1) ? key : e.key;
                const hotkey = [...modifiers, finalKey].join('+');

                elements.hotkey.value = hotkey;
                elements.hotkey.classList.remove('recording');
                isRecordingHotkey = false;

                console.log('New hotkey recorded:', hotkey);
                electronAPI.saveSetting('hotkey', hotkey);
                elements.hotkey.blur();
            }
        });
    }

    if (elements.closeBtn) {
        elements.closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (electronAPI && electronAPI.closeSettings) {
                electronAPI.closeSettings();
            } else {
                window.close();
            }
        });
    }

    // Run init
    init();
})();
