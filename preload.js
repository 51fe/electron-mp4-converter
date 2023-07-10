const { contextBridge, ipcRenderer } = require('electron');
const Toastify = require('toastify-js');

contextBridge.exposeInMainWorld('Toastify', {
  toast: (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('dialog:selectFile'),
  onSelectFile: (callback) => ipcRenderer.on('menu:selectFile', callback),
  readFile: (path) => ipcRenderer.invoke('video:readFile', path),
  convertFile: (params) => ipcRenderer.invoke('video:convertFile', params),
  saveFile: (callback) => ipcRenderer.invoke('dialog:saveFile', callback),
  onSaveFile: (callback) => ipcRenderer.on('menu:saveFile', callback),
  updatePercent: (callback) => ipcRenderer.on('percent:update', callback)
});
