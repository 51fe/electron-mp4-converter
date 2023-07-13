export interface IElectronAPI {
  selectFile: () => Promise<string>
  onSelectFile: (callback: (event: IpcRendererEvent) => void) => IpcRenderer
  readFile: (filePath) => Promise<Video>
  convertFile: (params) => Promise<void>
  saveFile: () => Promise<string>
  onSaveFile: (callback: (event: IpcRendererEvent) => void) => IpcRenderer
  updatePercent: (callback: () => void) => void
  previewFile: (event) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
