import Store from 'electron-store';

const store = new Store({
    defaults: {
        alwaysOnTop: false,
        hotkey: 'Control+Shift+G',
        startMinimized: false,
        runAtStartup: false,
        quitOnClose: false,
        invisibilityMode: false
    }
});

export default store;
