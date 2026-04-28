const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("translationSettingsApi", {
  getSettings: () => ipcRenderer.invoke("translation-settings:get"),
  updateSettings: (settings) =>
    ipcRenderer.invoke("translation-settings:update", settings),
});
