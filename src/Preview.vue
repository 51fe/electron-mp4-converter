<script lang="ts" setup>
import { ElButton } from 'element-plus'
import { handleSaveFile } from './utils'

import { ref } from 'vue'

const video = ref({
  filePath: '',
  width: 0,
  height: 0
})

window.electronAPI.previewFile((_event: any, _video: VideoElement) => {
  video.value = _video
})
</script>
<template>
  <div class="wrapper">
    <video
      :width="video.width"
      :height="video.height"
      :src="video.filePath"
      controls
      autoplay
    >
      浏览器不支持HTML5 video
    </video>
    <el-button
      type="primary"
      @click="handleSaveFile"
      >保存视频
    </el-button>
  </div>
</template>

<style>
body {
  margin: 0;
}

.wrapper {
  height: 100vh;
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
}

video {
  margin: auto;
}

.el-button {
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>
