<template>
  <div class="quick_meet_wrapper">
    <titleBar min full forceClose ref="titleBarRef" title="会议详情">
      <template #macLayout>
        <MeetingHeader v-model="layoutType" :effect="effect"></MeetingHeader>
      </template>
    </titleBar>
    <div class="body">
      <layout-grid v-if="layoutType === Layout.GRID && Object.keys(baseInfo).length" ref="LayoutGridRef" :baseInfo="baseInfo" :userInfo="userInfo" :screenId="screenId" />
      <layout-top v-if="layoutType === Layout.TOP && Object.keys(baseInfo).length" :baseInfo="baseInfo" :userInfo="userInfo" :screenId="screenId" />
      <layout-right v-if="layoutType === Layout.RIGHT && Object.keys(baseInfo).length" :baseInfo="baseInfo" :userInfo="userInfo" :screenId="screenId" />
    </div>
    <MeetingFooter v-model="footerActive" :baseInfo="baseInfo" @openCamera="handleOpenCamera" @stopCamera="handleStopCamera"></MeetingFooter>
  </div>
</template>

<script lang='ts' setup>
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Layout, type BaseInfo, SettingFormData, ThemeType } from './meeing_window_type'
import { openCamera, stopCamera } from '@/utils/media'
import { getLocalStorage } from '@/utils/localStorage'
import { useUserInfoStore, type UserInfo } from '@/store/userInfo'
import { ElMessage, ElMessageBox } from 'element-plus'
import { joinMeeting } from '@/service/service'
import titleBar from '@/components/titleBar/titleBar.vue'
import LayoutGrid from './Layout/Layout_Grid.vue'
import LayoutTop from './Layout/Layout_Top.vue'
import LayoutRight from './Layout/Layout_Right.vue'
import MeetingHeader from './components/Meeting_Window_Header.vue'
import MeetingFooter from './components/Meeting_Window_Footer.vue'

const route = useRoute()
const userInfoStore = useUserInfoStore()
const init = ref<boolean>(false)
const layoutType = ref<Layout>(Layout.GRID)
const effect = ref<ThemeType>('light')
const footerActive = ref<string>("")
const baseInfo = ref<BaseInfo>({} as BaseInfo) // 获取基础的配置信息
const microphone = ref<MediaDeviceInfo | null>(null)
const stream = ref<MediaStream | null>(null) // 获取摄像头信息
const LayoutGridRef = ref<InstanceType<typeof LayoutGrid>>()
const titleBarRef = ref<InstanceType<typeof titleBar>>()

onMounted(() => {
  initEnv()
  themeChanged()
  listenWindowCLose()
})

onUnmounted(() => {
  removeStream()
  removeListener()
})

// 通过路由获取屏幕的id
const screenId = computed<string>(() => (route.query.screenId) as string ?? "")
const userInfo = computed<UserInfo>(() => getLocalStorage("userInfo") as UserInfo)

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
  await initJoinMeeting((baseInfo.value.cameraEnable && baseInfo.value.cameraOpen) || screenId.value.length > 0)
}

  // 进入会议页面调用该方法，会触发websocket消息
function initJoinMeeting(videoOpen: boolean): Promise<void> {
  return joinMeeting({
    videoOpen
  }).then((res: any) => {
    if (res && res.code === 200) {
      ElMessage.success('加入会议成功')
    }
  })
}

function handleOpenCamera() {
  // stream.value = await openCamera()
  // if (stream.value) {
  //   baseInfo.value.cameraOpen = true
  //   baseInfo.value.cameraEnable = stream.value
  // }
  // removeStream()
}

function handleStopCamera() {
  // removeStream()
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

function listenWindowCLose(): void {
  window.electron.ipcRenderer.on("window-will-close", () => {
    ElMessageBox.confirm('是否退出当前会议？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: "warning"
    }).then(() => {
      titleBarRef.value?.handleClickForceClose()
    })
  })
}

function removeStream() {
  if (stream.value) {
    stream.value.getTracks().forEach(track => {
      track.stop()
    })
    stream.value = null
  }
}

function removeListener(): void {
  window.electron.ipcRenderer.removeAllListeners('window-will-close')
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