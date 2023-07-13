import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('dialog:selectFile'),
  onSelectFile: (callback: () => void) =>
    ipcRenderer.on('menu:selectFile', callback),
  readFile: (path: string) => ipcRenderer.invoke('video:readFile', path),
  convertFile: (params: Params) =>
    ipcRenderer.invoke('video:convertFile', params),
  saveFile: () => ipcRenderer.invoke('dialog:saveFile'),
  onSaveFile: (callback: () => void) =>
    ipcRenderer.on('menu:saveFile', callback)
})
