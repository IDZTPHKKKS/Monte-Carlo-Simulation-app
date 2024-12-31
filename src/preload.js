const { contextBridge, ipcRenderer } = require('electron');

// Expose a secure API to the renderer process for navigating to pages
contextBridge.exposeInMainWorld('electron', {
  getPagePath: (category) => ipcRenderer.invoke('get-page-path', category)
});
