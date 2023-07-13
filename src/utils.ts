import { ElMessage } from 'element-plus'

function formatSize(value: number = 0) {
  if (value === 0) {
    return '0 B'
  }
  const unitArr = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let index = 0
  index = Math.floor(Math.log(value) / Math.log(1024))
  const size = value / Math.pow(1024, index)
  //  保留的小数位数
  const sizeStr = Number.isInteger(size) ? size.toString() : size.toFixed(2)
  return `${sizeStr} ${unitArr[index]}`
}

async function handleSaveFile() {
  const result = await window.electronAPI.saveFile()
  if (result) {
    ElMessage.success(result)
  } else {
    ElMessage.warning('取消了保存')
  }
}

export { formatSize, handleSaveFile }
