const selectBtn = document.getElementById('selectBtn');
const placeholder = document.getElementById('placeholder');
let convertBtn;
const requiredMsg = '文件不能为空';
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
selectBtn.addEventListener('click', handleSelect);

async function handleSelect(event) {
  let filePath = '';
  const files = event.dataTransfer?.files ?? null;
  // drag and drop
  if (files) {
    filePath = files[0].path;
  } else {
    filePath = await electronAPI.selectFile();
  }
  if (!filePath) return $warning(requiredMsg);
  const index = filePath.lastIndexOf('.');
  const ext = filePath.substring(index + 1);
  if (!allowFormats.includes(ext)) {
    return $warning('文件格式不支持');
  }
  try {
    const data = await electronAPI.readFile(filePath);
    const { filename, format_name, width, height, size, duration, codec } =
      data;
    let { videoBitrate, audioBitrate, channels } = data;
    let start = 0,
      end = duration,
      ratio = 1;
    // remove add area
    const wrapper = document.querySelector('.wrapper');
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }

    placeholder.innerHTML = `
    <fieldset>
      <legend>原视频</legend>
      <ul class="info">
        <li>文件: ${filename}</li>
        <li>格式: ${format_name}</li>
        <li>宽高: ${width}x${height}</li>
      </ul>
      <ul class="info">
        <li>大小: ${formatSize(size)}</li>
        <li>时长: ${duration}</li>
        <li>视频比特率: ${videoBitrate}</li>
      </ul>
      <ul class="info">
        <li>音频比特率: ${audioBitrate}</li>
        <li>编码: ${codec}</li>
        <li>声道: ${channels}</li>
      </ul>
    </fieldset>
    <fieldset class="container">
      <legend>操作</legend>
      <div class="form">
        <div class="row">
          开始：<input id="start" type="range" min="0" max="${duration}" step="0.1" value="${start}" />
          <span>${start} 秒</span>
        </div>
        <div class="row">
          结束：<input id="end" type="range" min="0" max="${duration}" step="0.1" value="${duration}" />
          <span>${end} 秒</span>
        </div>
        <div class="row">
          宽高：<input id="ratio" type="range" min="1" max="2" step="0.25" value="${ratio}" />
          <span>${width * ratio}x${height * ratio}</span>
        </div>
        <div class="row">
          画质：
          <label>
            <input type="radio" name="vb" value="200k" />
            普通
          </label>
          <label>
            <input type="radio" name="vb" value="400k" />
            标清
          </label>
          <label>
            <input type="radio" name="vb" value="800k" />
            高清
          </label>
          <label>
            <input type="radio" name="vb" value="1600k" />
            超清
          </label>
        </div>
        <div class="row">
          音质：
          <label>
            <input type="radio" name="ab" value="32k" />
            AM
          </label>
          <label>
            <input type="radio" name="ab" value="64k" />
            FM
          </label>
          <label>
            <input type="radio" name="ab" value="128k" />
            CD
          </label>
          <label>
            <input type="radio" name="ab" value="256k" />
            DVD
          </label>
        </div>
        <div class="row">
          声道：
          <label>
            <input type="radio" name="channels" value="2" />
            双声道
          </label>
          <label>
            <input type="radio" name="channels" value="1" />
            单声道
          </label>
        </div>
        <div class="row">
          <button id="convertBtn" class="btn">转换</button>
          <button id="saveBtn" class="btn">保存</button>
        </div>
      </div>
      <div class="right">
        <div id="result">&nbsp;</div>
      </div>
    </fieldset>
    `;
    const rightEl = document.querySelector('.right');
    if (!rightEl.contains(selectBtn)) {
      rightEl.append(selectBtn);
      selectBtn.classList.add('normal');
    }

    document.getElementById('start').addEventListener('change', (event) => {
      start = event.target.value;
      event.target.nextElementSibling.innerText = `${start} 秒`;
    });

    document.getElementById('end').addEventListener('change', (event) => {
      end = event.target.value;
      event.target.nextElementSibling.innerText = `${end} 秒`;
    });

    document.getElementById('ratio').addEventListener('change', (event) => {
      ratio = parseFloat(event.target.value);
      event.target.nextElementSibling.innerText = `${width * ratio}x${
        height * ratio
      }`;
    });

    document.querySelectorAll('input[name="vb"]').forEach((radio) => {
      radio.addEventListener('change', (event) => {
        videoBitrate = event.target.value;
      });
      radio.checked = radio.value === videoBitrate;
    });

    document.querySelectorAll('input[name="ab"]').forEach((radio) => {
      radio.addEventListener('change', (event) => {
        audioBitrate = event.target.value;
      });
      radio.checked = radio.value === audioBitrate;
    });

    document.querySelectorAll('input[name="channels"]').forEach((radio) => {
      radio.addEventListener('change', (event) => {
        channels = parseInt(event.target.value);
      });
      radio.checked = parseInt(radio.value) === channels;
    });

    convertBtn = document.getElementById('convertBtn');
    convertBtn.addEventListener('click', async () => {
      await handleConvert({
        filePath,
        width,
        height,
        ratio,
        start,
        end,
        videoBitrate,
        audioBitrate,
        channels
      });
    });
    document.getElementById('saveBtn').addEventListener('click', handleSave);
  } catch (error) {
    $error(error.message);
  }
}

async function handleConvert(params) {
  const { filePath } = params;
  if (!filePath) return $warning(requiredMsg);
  convertBtn.innerText = '转换中...';
  try {
    await electronAPI.convertFile(params);
    convertBtn.innerText = '转换';
  } catch (error) {
    $error(error.message);
  }
}

electronAPI.updatePercent((event, percent) => {
  convertBtn.innerText = `完成 ${percent} %`;
});

electronAPI.onSelectFile((event) => handleSelect(event));

electronAPI.onSaveFile(() => handleSave());

function formatSize(value) {
  if (value === 0 || value === '') {
    return '0B';
  }
  let unitArr = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let index = 0;
  let srcSize = parseFloat(value);
  index = Math.floor(Math.log(srcSize) / Math.log(1024));
  let size = srcSize / Math.pow(1024, index);
  //  保留的小数位数
  size = Number.isInteger(size) ? size : size.toFixed(2);
  return `${size} ${unitArr[index]}`;
}

selectBtn.addEventListener('drop', (event) => {
  event.preventDefault();
  event.stopPropagation();
  handleSelect(event);
});

document.addEventListener('dragover', (event) => {
  event.preventDefault();
  event.stopPropagation();
});
