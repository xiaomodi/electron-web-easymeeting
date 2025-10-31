<template>
  <div class="titlebar_wrapper">
    <div class="titleItem">
      <div v-show="isShowTitleBar" class="content">
        <div v-if="close" class="icon_close" :class="{'blur': blur}" @click="handleClickClose"></div>
        <div v-if="forceClose" class="icon_close" :class="{'blur': blur}" @click="handleClickClose"></div>
        <div v-if="min" class="icon_min" :class="{'blur': blur}"  @click.prevent="handleClickMin"></div>
        <div v-if="full" class="icon_max" :class="{'blur': blur}"  @click="handleClickFull"></div>
      </div>
    </div>
    <div class="titleItem title">
      <div class="layout">
        <slot name="windowsLayout"></slot>
      </div>  
      <div class="layout">
        {{ title }}
      </div>
      <div class="layout macLayout">
        <slot name="macLayout"></slot>
      </div>
    </div>
    <div class="titleItem"></div>
  </div>
  <div v-if="isPosition" class="title_height"></div>
</template>

<script lang='ts' setup>
import { ref, defineExpose, defineProps, withDefaults, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  min?: boolean,
  max?: boolean,
  full?: boolean,
  close?: boolean,
  forceClose?: boolean,
  closeType?: number
  title?: string,
  isPosition?: boolean
}>(), {
  min: false,
  max: false,
  full: false,
  close: false, // 普通关闭
  forceClose: false, // 是否需要强制关闭
  closeType: 0, // 0: 关闭 1: 隐藏
  title: "",
  isPosition: true
})

enum WindowType {
  MIN = 'minimize',
  MAX = 'maximize',
  FULL = 'fullscreen',
  CLOSE = 'close'
}

interface WindowControlType {
  type: WindowType,
  forceClose?: boolean
}

const blur = ref<boolean>(false)
const isShowTitleBar = ref<boolean>(true)

onMounted(() => {
  getIpcrendererListener() 
})

onUnmounted(() => {
  removeIpcrendererListener()
})

function getIpcrendererListener(): void {
  // 判断窗口失去焦点了
  window?.electron?.ipcRenderer?.on("window-blur", () => {
    blur.value = true
  })
  // 判断窗口获得焦点了
  window?.electron?.ipcRenderer?.on("window-focus", () => {
    blur.value = false
  })
  // 判断是否全屏
  window?.electron?.ipcRenderer?.on("window-fullscreen", (e, res: boolean) => {
    if (res) {
      isShowTitleBar.value = false
    } else {
      isShowTitleBar.value = true
    }
  })
}

function removeIpcrendererListener(): void {
  window.electron.ipcRenderer.removeAllListeners("window-blur")
  window.electron.ipcRenderer.removeAllListeners("window-focus")
  window.electron.ipcRenderer.removeAllListeners("window-fullscreen")
}

function handleWindowType(listen: string, type: WindowControlType):void {
  window.electron.ipcRenderer.send(listen, type)
}

function handleClickClose(): void {
  handleWindowType("window-control", { type: WindowType.CLOSE })
}

function handleClickForceClose(): void {
  handleWindowType("window-control", { type: WindowType.CLOSE, forceClose: true })
}

function handleClickMin(): void {
  handleWindowType("window-control", { type: WindowType.MIN })
}

function handleClickFull(): void {
  handleWindowType("window-control", { type: WindowType.FULL })
}

defineExpose({
  handleClickForceClose
})

</script>

<style lang="scss" scoped>
.titlebar_wrapper {
  -webkit-app-region: drag;
  width: 100%;
  height: 28px;
  background-color: transparent;
  padding: 0 6px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  font-size: 13px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  .titleItem {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    &:first-child {
      justify-content: flex-start;
    }
    &:last-child {
      justify-content: flex-end;
    }
    &.title {
      flex: 5;
      display: flex;
    }
    .content {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .layout {
      flex: 1;
      line-height: 1;
      display: flex;
      justify-content: center;
      &:first-child {
        justify-content: flex-start;
      }
      &:last-child {
        justify-content: flex-end;
      }
      &.macLayout {
        -webkit-app-region: no-drag;
      }
    }
    .icon_close {
      -webkit-app-region: no-drag;
      width: 12px;
      height: 12px;
      background: #f56c6c;
      border-radius: 100%;
      margin-right: 8px;
      &.blur {
        background: #e4e7ed
      }
    }
    .icon_min {
      -webkit-app-region: no-drag;
      width: 12px;
      height: 12px;
      background: #e6a23c;
      border-radius: 100%;
      margin-right: 8px;
      &.blur {
        background: #e4e7ed
      }
    }
    .icon_max {
      -webkit-app-region: no-drag;
      width: 12px;
      height: 12px;
      background: #67c23a;
      border-radius: 100%;
      margin-right: 8px;
      &.blur {
        background: #e4e7ed
      }
    }
  }
}
.title_height {
  width: 100%;
  height: 28px;
}
</style>