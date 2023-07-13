import { MenuItem, MenuItemConstructorOptions, shell } from 'electron'

const isMac = process.platform === 'darwin'
const menuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [
  {
    label: '视频文件',
    submenu: [
      {
        id: 'selectFile',
        label: '选择视频',
        accelerator: 'CmdOrCtrl+O'
      },
      {
        id: 'saveFile',
        label: '保存视频',
        accelerator: 'CmdOrCtrl+S',
        enabled: false
      },
      { type: 'separator' },
      isMac
        ? {
            role: 'close',
            label: '退出',
            accelerator: 'Cmd+Q'
          }
        : {
            role: 'quit',
            label: '退出',
            accelerator: 'Ctrl+Q'
          }
    ]
  },
  {
    label: '帮助',
    submenu: [
      {
        id: 'about',
        label: '关于'
      },
      {
        id: 'support',
        label: '技术支持',
        click() {
          shell.openExternal('mailto:riafan@hotmail.com')
        }
      }
    ]
  }
]

export { menuTemplate }
