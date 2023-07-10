const player = document.getElementById('player');
const saveBtn = document.getElementById('saveBtn');

electronAPI.previewFile((event, { filePath, width, height }) => {
  player.src = filePath;
  player.width = width;
  player.height = height;
});

saveBtn.addEventListener('click', handleSave);
