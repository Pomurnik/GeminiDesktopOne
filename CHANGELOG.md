# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-01-12
### ✨ New Features
- **Invisibility Mode**: Hide the application window from screen capture (Teams/Zoom) and Taskbar.
- **Version Display**: Added app version indicator in Settings.
- **Improved Shortcuts**: Reverted to stable Electron shortcuts (requires Admin just for VMware focus).

### 🐛 Bug Fixes
- **Tray Quit**: Fixed an issue where the Tray "Quit" button would only hide the window.
- **Menu Compact**: Removed padding from tray menu.

## [0.1.0] - 2026-01-12

### 🚀 Launched
- **Initial Release**: First public preview of Gemini Desktop One.
- **Native Experience**: Standalone Windows application with a premium dark theme (`#131314`).

### ✨ Features
- **Secure Login**: Implemented advanced header sanitization to bypass Google's "Unsafe Browser" check.
- **Global Hotkey**: Toggle the app instantly with `Ctrl+Shift+G` (configurable/recordable in Settings).
- **System Tray**: Minimize to tray support with context menu actions.
- **Auto-Start**: Option to launch automatically on system boot.
- **Quit on Close**: Configurable behavior for the window close button (Minimize vs Quit).
- **Settings UI**: Dedicated settings window with a custom "floating" header design.

### 🛠️ Technical
- **Modular Architecture**: Refactored codebase into `src/main`, `src/renderer`, and `src/services`.
- **Electron Store**: Persistent configuration management.
- **Auto-Launch**: Integrated native system startup handling.
