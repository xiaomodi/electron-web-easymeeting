<template>
  <div class="quick_meet_wrapper">
    <titleBar min full close title="会议详情">
      <template #macLayout>
        <MeetingHeader v-model="layoutType" :effect="effect"></MeetingHeader>
      </template>
    </titleBar>
    <div class="body">
      <layout-grid v-if="layoutType === Layout.GRID && Object.keys(baseInfo).length" ref="LayoutGridRef" :mumberList="mumberList" :baseInfo="baseInfo" :userInfo="userInfo" :screenId="screenId" />
      <layout-top v-if="layoutType === Layout.TOP && Object.keys(baseInfo).length" :mumberList="mumberList" :baseInfo="baseInfo"></layout-top>
      <layout-right v-if="layoutType === Layout.RIGHT && Object.keys(baseInfo).length" :mumberList="mumberList" :baseInfo="baseInfo"></layout-right>
    </div>
    <MeetingFooter v-model="footerActive" :baseInfo="baseInfo" @stopCamera="handleStopCamera" @openCamera="handleOpenCamera"></MeetingFooter>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Layout, type BaseInfo, SettingFormData, ThemeType } from './type'
import { openCamera, stopCamera } from '@/utils/media'
import { useUserInfoStore, type UserInfo } from '@/store/userInfo'
import { ElMessage } from 'element-plus'
import titleBar from '@/components/titleBar/titleBar.vue'
import LayoutGrid from './Layout/Layout-Grid.vue'
import LayoutTop from './Layout/Layout-Top.vue'
import LayoutRight from './Layout/Layout-Right.vue'
import MeetingHeader from './components/Header.vue'
import MeetingFooter from './components/Footer.vue'

const route = useRoute()
const userInfoStore = useUserInfoStore()
const init = ref<boolean>(false)
const layoutType = ref<Layout>(Layout.GRID)
const effect = ref<ThemeType>('light')
const footerActive = ref<string>("")
const baseInfo = ref<BaseInfo>({
  micEnable: null,
  cameraEnable: null,
  micOpen: false,
  cameraOpen: false,
}) // 获取基础的配置信息
const microphone = ref<MediaDeviceInfo | null>(null)
const stream = ref<MediaStream | null>(null) // 获取摄像头信息
const LayoutGridRef = ref<InstanceType<typeof LayoutGrid>>()
const mumberList = ref<any[]>([])

onMounted(() => {
  initEnv()
  themeChanged()
})

onUnmounted(() => {
  removeListener()
})

// 通过路由获取屏幕的id
const screenId = computed<string>(() => (route.query.screenId) as string ?? "")
const userInfo = computed<UserInfo>(() => userInfoStore.userInfo)

async function initEnv() {
  const sysSetting = await getSetting()   // 获取配置文件
  if (sysSetting.openMicrophone) {
    const devices = await navigator.mediaDevices.enumerateDevices()
    microphone.value = devices.find(device => device.kind === 'audioinput') ?? null    // 首先需要获取麦克风
  }
  if (sysSetting.openVideo) {
    // 获取摄像头
    stream.value = await openCamera()
  }
  baseInfo.value = {
    micEnable: microphone.value,
    cameraEnable: stream.value,
    micOpen: sysSetting.openMicrophone,
    cameraOpen: sysSetting.openVideo,
  }
}

async function handleOpenCamera() {
  stream.value = await openCamera()
  if (stream.value && LayoutGridRef.value) {
    baseInfo.value.cameraEnable = stream.value
    LayoutGridRef.value.initVideo()
    ElMessage({
      message: '摄像头已开启！',
      type: 'success'
    })
  }
}

function handleStopCamera() {
  stopCamera().then(() => {
    ElMessage({
      message: '摄像头已关闭！',
      type: 'success'
    })
  })
}

async function getSetting(): Promise<SettingFormData> {
  const settingData = await window.electron.ipcRenderer.invoke("setting-get")
  effect.value = settingData.themeValue
  return settingData
}

function themeChanged(): void {
  window.electron.ipcRenderer.on("mainWindow-theme-changed", (e, theme) => {
    document.documentElement.setAttribute('theme', theme)
    effect.value = theme
  })
}

function removeListener(): void {
  window.electron.ipcRenderer.removeAllListeners('mainWindow-theme-changed')
}

</script>

<style lang="scss" scoped>
.quick_meet_wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  .body {
    width: 100%;
    flex: 1;
    border: 1px solid var(--border-color-dark);
    overflow: hidden;
  }
}
</style>