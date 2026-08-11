const { app, BrowserWindow } = require("electron");
const path = require("path");



//process.env.NODE_ENV = "production";
const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== "production";

const electronReload = require('electron-reload');
electronReload(__dirname);

let mainWindow;
const MAIN_WINDOWS_WIDTH = 1920;
const MAIN_WINDOWS_HEIGHT = 1080;

function createWindow() {
    const window = new BrowserWindow({
        width: isDev ? 960 : MAIN_WINDOWS_WIDTH,
        height: isDev ? 540 : MAIN_WINDOWS_HEIGHT,

        frame: false,
        //fullscreen: true,

        backgroundColor: "#000000",

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    window.loadFile(
        path.join(__dirname, "../../renderer/index.html")
    );
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});