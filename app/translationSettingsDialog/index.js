const { BrowserWindow } = require("electron");
const path = require("node:path");

class TranslationSettingsDialog {
  #window = null;
  #parentWindow = null;

  constructor(parentWindow) {
    this.#parentWindow = parentWindow;
  }

  show() {
    if (this.#window && !this.#window.isDestroyed()) {
      if (this.#window.isMinimized()) {
        this.#window.restore();
      }
      this.#window.show();
      this.#window.focus();
      return;
    }

    this.#window = new BrowserWindow({
      title: "AI Assistant Settings",
      width: 620,
      height: 700,
      resizable: true,
      minimizable: false,
      maximizable: false,
      modal: true,
      parent: this.#parentWindow,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    this.#window.loadFile(path.join(__dirname, "translationSettings.html"));

    this.#window.once("ready-to-show", () => {
      this.#window.show();
      this.#window.focus();
    });

    this.#window.on("closed", () => {
      this.#window = null;
    });
  }
}

module.exports = TranslationSettingsDialog;
