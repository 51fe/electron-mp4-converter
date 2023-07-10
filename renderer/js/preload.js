const { contextBridge, ipcRenderer } = require('electron');
const Toastify = require('toastify-js');

contextBridge.exposeInMainWorld('Toastify', {
  toast: (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld('electronAPI', {
  previewFile: (callback) => ipcRenderer.on('video:preview', callback),
  saveFile: (callback) => ipcRenderer.invoke('dialog:saveFile', callback)
});
