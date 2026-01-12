// Use self-invoking function to avoid global namespace pollution and redeclaration errors
(function () {
    console.log('Main renderer script starting...');

    const getApi = () => window.electronAPI;

    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM Content Loaded');

        // Disable context menu on title bar
        const titleBar = document.getElementById('title-bar');
        if (titleBar) {
            titleBar.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }
        const settingsBtn = document.getElementById('settingsBtn');
        const minimizeBtn = document.getElementById('minimizeBtn');
        const closeBtn = document.getElementById('closeBtn');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Settings clicked');
                const api = getApi();
                if (api) api.openSettings();
                else console.error('electronAPI not found');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close clicked');
                const api = getApi();
                if (api) api.windowControl('close');
                else console.error('electronAPI not found');
            });
        }

        const api = getApi();
        if (api) {
            api.onSettingsUpdate((settings) => {
                console.log('Settings updated in renderer:', settings);
            });
        } else {
            console.error('electronAPI not available at startup');
        }
    });
})();
