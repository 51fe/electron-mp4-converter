/* eslint-disable no-unused-vars */
function $success(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    style: {
      background: '#00CC00',
      color: 'white',
      textAlign: 'center'
    }
  });
}

function $error(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    style: {
      background: '#CC0000',
      color: 'white',
      textAlign: 'center'
    }
  });
}

function $warning(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    style: {
      background: '#FFFF33',
      color: '#CC6666',
      textAlign: 'center'
    }
  });
}

async function handleSave() {
  const result = await electronAPI.saveFile();
  if (result) {
    $success(result);
  } else {
    $warning('取消了保存');
  }
}
