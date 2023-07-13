import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  previewFile: (callback: () => void) =>
    ipcRenderer.on('video:preview', callback),
  saveFile: (callback: () => void) =>
    ipcRenderer.invoke('dialog:saveFile', callback)
})
