const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const os = require('os');
const path = require('path');
const fs = require('fs');

const { menuTemplate } = require('./config');

const ffmpeg = require('fluent-ffmpeg');
// Get the paths to the packaged versions of the binaries we want to use
const ffmpegPath = require('ffmpeg-static').replace(
  'app.asar',
  'app.asar.unpacked'
);
const ffprobePath = require('ffprobe-static').path.replace(
  'app.asar',
  'app.asar.unpacked'
);
// tell the ffmpeg package where it can find the needed binaries.
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const isDev = !app.isPackaged
const fileType = 'video';
const allowFormats = [
  'wmv',
  '3gp',
  'avi',
  'f4v',
  'm4v',
  'mp4',
  'mpg',
  'ogv',
  'vob'
];


const menu = Menu.buildFromTemplate(menuTemplate);
const output = path.join(app.getPath('temp'), 'temp.mp4');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: isDev ? 1200 : 800,
    height: 500,
    resizable: false,
    nodeIntegration: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  menu.getMenuItemById('selectFile').click = () =>
      mainWindow.webContents.send('menu:selectFile');
  menu.getMenuItemById('saveFile').click = () =>
      mainWindow.webContents.send('menu:saveFile');
  menu.getMenuItemById('about').click = () => createAboutDialog();
  Menu.setApplicationMenu(menu);

  mainWindow.loadFile('renderer/index.html');
  if (isDev) mainWindow.webContents.openDevTools();
}

async function createPreview({ width, height }) {
  const win = new BrowserWindow({
    width: width + 16,
    height: height + 88,
    webPreferences: {
      preload: path.join(__dirname, 'renderer/js/preload.js')
    }
  });
  await win.loadFile('renderer/preview.html');
  win.webContents.send('video:preview', {
    filePath: output,
    width,
    height
  });
  win.removeMenu();
}

function createAboutDialog() {
  dialog.showMessageBox(null, {
    title: '关于',
    message: `    
    Electron：${process.versions.electron}
    Chromium：${process.versions.chrome}
    Node.js：${process.versions.node}
    V8：${process.versions.v8}
    OS：${process.env.OS} ${os.arch} ${os.release}
    `
  });
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:selectFile', handleSelectFile);
  ipcMain.handle('video:readFile', handleReadFile);
  ipcMain.handle('video:convertFile', handleConvertFile);
  ipcMain.handle('dialog:saveFile', handleSaveFile);
  createWindow();
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

async function handleSelectFile() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: fileType, extensions: allowFormats }]
  });
  if (!canceled) {
    return filePaths[0];
  }
}

async function handleReadFile(event, filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath).ffprobe((err, data) => {
      if (err) return reject(err);

      const { format, streams } = data;
      const { format_name, duration, size, bit_rate } = format;
      let audioBitrate = bit_rate,
        videoBitrate = bit_rate,
        codec,
        width,
        height,
        channels;
      const video = streams.find((item) => item.codec_type === 'video');
      if (video) {
        width = video.width;
        height = video.height;
        codec = video.codec_name;
        videoBitrate = Math.round(video.bit_rate / 1000) + 'k';
      }
      const audio = streams.find((item) => item.codec_type === 'audio');
      if (audio) {
        audioBitrate = Math.round(audio.bit_rate / 1000) + 'k';
        channels = audio.channels;
        codec += `/${audio.codec_name}`;
      }
      // enabled saveFile menu item
      menu.getMenuItemById('saveFile').enabled = true;
      resolve({
        filename: path.parse(filePath).name,
        format_name,
        width,
        height,
        size,
        duration,
        videoBitrate,
        audioBitrate,
        codec,
        channels
      });
    });
  });
}

async function handleConvertFile(
  event,
  {
    filePath,
    width,
    height,
    ratio = 1,
    start = 0,
    end = 10,
    videoBitrate = '',
    audioBitrate = '',
    channels = 2
  }
) {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .outputOptions([`-ss ${start}`, `-to ${end}`])
      // set video bitrate
      .videoBitrate(videoBitrate)
      // set target codec
      .videoCodec('libx264')
      // set audio bitrate
      .audioBitrate(audioBitrate)
      // set audio codec
      .audioCodec('libmp3lame')
      // set number of audio channels
      .audioChannels(channels)
      .size(`${ratio * 100}%`)
      // set custom option
      // set output format to force
      .format('mp4')
      // save to file
      .save(output)
      // setup event handlers
      .on('progress', (progress) => {
        const percent = Math.floor(progress.percent);
        console.log(`Processing: ${percent} % done`);
        const win = BrowserWindow.fromWebContents(event.sender);
        win.send('percent:update', percent);
      })
      .on('end', () => {
        console.log('file has been converted succesfully');
        createPreview({
          filePath: output,
          width,
          height
        });
        resolve(output);
      })
      .on('error', (err) => reject(err));
  });
}

async function handleSaveFile() {
  const { canceled, filePath } = await dialog.showSaveDialog({
    filters: [{ name: fileType, extensions: ['mp4'] }],
    defaultPath: path.join(app.getPath('videos'), `${Date.now()}.mp4`)
  });
  if (!canceled) {
    return new Promise((resolve, reject) => {
      const rs = fs.createReadStream(output);
      const ws = fs.createWriteStream(filePath);
      rs.pipe(ws);
      rs.on('end', () => {
        resolve('视频保存成功');
      }).on('error', (error) => {
        reject(error);
      });
    });
  }
}