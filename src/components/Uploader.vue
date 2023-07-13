<template>
  <div class="uploader">
    <img
      class="add-btn"
      src="/add-video.svg"
      alt="add-video.svg"
    />
    <h4 class="hint">点击选择或拖拽添加</h4>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.uploader {
  cursor: pointer;
  display: inline-block;
}

.uploader .add-btn {
  width: 200px;
}

.uploader .hint {
  font-size: 16px;
  font-weight: 500;
  color: #999;
  text-align: center;
}
</style>
