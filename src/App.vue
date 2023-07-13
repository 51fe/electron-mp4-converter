<script setup lang="ts">
import { reactive, ref } from 'vue'

import {
  ElButton,
  ElMessage,
  ElForm,
  ElFormItem,
  ElRadio,
  ElRadioGroup,
  ElSlider
} from 'element-plus'

import { formatSize, handleSaveFile } from './utils'
import { allowFormats } from '../setting'
import Uploader from './components/Uploader.vue'

let video = ref({
  filename: '',
  format_name: '',
  width: 0,
  height: 0,
  size: 0,
  duration: 0,
  videoBitrate: '',
  audioBitrate: '',
  codec: '',
  channels: 0
})

const form = reactive({
  range: [0, 10],
  ratio: 1,
  videoBitrate: '',
  audioBitrate: '',
  channels: 2
})

const marks = {
  10: '10 秒',
  30: '30 秒',
  60: '60 秒',
  300: '5 分钟'
}

const formatTooltip = (value: number) => `${value} 秒`
const once = ref(false)
const requiredMsg = '文件不能为空'
const errorMsg = '出错了~'

let extras: { filePath: string } & Pick<Video, 'width' | 'height'>

async function handleSelect() {
  const filePath = await window.electronAPI.selectFile()
  await handleReadFile(filePath)
}

async function handleDrop(event: DragEvent) {
  const filePath = event.dataTransfer?.files[0].path!
  await handleReadFile(filePath)
}

async function handleReadFile(filePath: string) {
  if (!filePath) return ElMessage.warning(requiredMsg)
  const index = filePath.lastIndexOf('.')
  const ext = filePath.substring(index + 1)
  if (!allowFormats.includes(ext)) {
    return ElMessage.warning('文件格式不支持')
  }
  try {
    video.value = await window.electronAPI.readFile(filePath)
    // remove add area
    once.value = true
    const { width, height, duration, videoBitrate, audioBitrate, channels } =
      video.value
    extras = { filePath, width, height }
    form.range = [0, duration]
    form.videoBitrate = videoBitrate
    form.audioBitrate = audioBitrate
    form.channels = channels
  } catch (err) {
    ElMessage.error(errorMsg)
  }
}

const converting = ref(false)

async function handleConvert() {
  const { range, ratio, videoBitrate, audioBitrate, channels } = form
  const params = {
    ratio,
    start: range[0],
    end: range[1],
    videoBitrate: videoBitrate ?? video.value.videoBitrate,
    audioBitrate: audioBitrate ?? video.value.audioBitrate,
    channels,
    ...extras
  }
  if (!extras.filePath) return ElMessage.warning(requiredMsg)
  converting.value = true
  try {
    await window.electronAPI.convertFile(params)
    converting.value = false
  } catch (err) {
    converting.value = false
    ElMessage.error(errorMsg)
  }
}

window.electronAPI.onSelectFile(handleSelect)
// save by click menu
window.electronAPI.onSaveFile(handleSaveFile)

document.addEventListener('dragover', (event) => {
  event.preventDefault()
  event.stopPropagation()
})
</script>

<template>
  <div
    v-if="!once"
    class="wrapper"
  >
    <Uploader
      @click="handleSelect"
      @drop.stop.prevent="handleDrop"
    />
  </div>
  <template v-else>
    <fieldset>
      <legend>原视频</legend>
      <ul class="info">
        <li>文件: {{ video.filename }}</li>
        <li>格式: {{ video.format_name }}</li>
        <li>宽高: {{ video.width }}x{{ video.height }}</li>
      </ul>
      <ul class="info">
        <li>大小: {{ formatSize(video.size) }}</li>
        <li>时长: {{ video.duration }}</li>
        <li>视频比特率: {{ video.videoBitrate }}</li>
      </ul>
      <ul class="info">
        <li>音频比特率: {{ video.audioBitrate }}</li>
        <li>编码: {{ video.codec }}</li>
        <li>声道: {{ video.channels }}</li>
      </ul>
    </fieldset>
    <fieldset class="container">
      <legend>操作</legend>
      <el-form :model="form">
        <el-form-item label="范围：">
          <el-slider
            v-model="form.range"
            range
            :marks="video.duration <= 300 ? marks : undefined"
            :max="video.duration"
            :step="0.1"
            :format-tooltip="formatTooltip"
          />
        </el-form-item>
        <el-form-item label="宽高：">
          <el-slider
            v-model="form.ratio"
            :min="1"
            :max="2"
            :step="0.25"
            :format-tooltip="
              () => `${video.width * form.ratio} x ${video.height * form.ratio}`
            "
          />
        </el-form-item>
        <el-form-item label="画质：">
          <el-radio-group v-model="form.videoBitrate">
            <el-radio label="200k">普通</el-radio>
            <el-radio label="400k">标清</el-radio>
            <el-radio label="800k">高清</el-radio>
            <el-radio label="1600k">超清</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="音质：">
          <el-radio-group v-model="form.audioBitrate">
            <el-radio label="32k">AM</el-radio>
            <el-radio label="64k">FM</el-radio>
            <el-radio label="128k">CD</el-radio>
            <el-radio label="256k">DVD</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="声道：">
          <el-radio-group v-model="form.channels">
            <el-radio :label="2">双声道</el-radio>
            <el-radio :label="1">单声道</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item class="btn-item">
          <el-button
            type="primary"
            :loading="converting"
            @click="handleConvert"
            >转换</el-button
          >
          <el-button
            type="primary"
            @click="handleSaveFile"
            >保存</el-button
          >
        </el-form-item>
      </el-form>
      <div class="right">
        <Uploader
          class="normal"
          @click="handleSelect"
          @drop.stop.prevent="handleDrop"
        />
      </div>
    </fieldset>
  </template>
</template>

<style>
body {
  margin: 0;
  padding: 4px 8px;
  user-select: none;
}

#app {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 16px);
}

.wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

ul {
  margin-top: 6px;
  margin-bottom: 6px;
}

.info {
  display: flex;
  flex-wrap: wrap;
}

.info > li {
  flex: 1;
  margin-right: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.container {
  display: flex;
  justify-content: space-between;
}

.el-slider {
  width: 320px;
}

.btn-item {
  padding-left: 160px;
}

.right {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.uploader.normal {
  transform: scale(0.8);
}
</style>
