<template>
  <el-config-provider :locale="zhCn">
   <router-view></router-view>
  </el-config-provider>
</template>

<script lang='ts' setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { onMounted }  from 'vue'
import { exitMeeting } from '@/service/service'

onMounted(() => {
  onExitMeetingWindow()
})

function onExitMeetingWindow(): void {
  window.electron.ipcRenderer.on("close-meeing-window", async (e, { windowId }) => {
    if (windowId === 'meeting') {
      await exitMeeting()
    }
  })
}

</script>

<style scoped>

</style>