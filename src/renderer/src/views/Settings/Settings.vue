<template>
  <div class="setting_wrapper">
    <h4>常规设置</h4>
    <div class="open_video">
      <el-checkbox v-model="settingFormData.openVideo" label="入会开启摄像头" size="large" @change="handleSaveSetting" />
    </div>
    <div class="open_microphone">
      <el-checkbox v-model="settingFormData.openMicrophone" label="入会开启摄麦克风" size="large" @change="handleSaveSetting"/>
    </div>
    <div class="toggle_theme">
      <p>切换主题：</p>
      <el-radio-group v-model="settingFormData.themeValue" @change="handleSaveSetting">
        <el-radio value="light" size="large">浅色主题</el-radio>
        <el-radio value="dark" size="large">深色主题</el-radio>
      </el-radio-group>
    </div>
    <h4>本地录制</h4>
    <div class="record_wrapper">
      录制文件保存目录
      <div class="record_input">{{ settingFormData.filePath }}</div>
      <el-button type="primary" size="small" @click="handleClickChangeFilePath">更改</el-button>
      <el-button type="success" size="small" @click="handleClickOpenFilePath">打开</el-button>
    </div>
    <h4>账号安全</h4>
    <div class="possword">
      <p>修改密码后，您需重新登陆</p>
      <el-button type="primary" size="small" @click="handleClickChangePassword">修改密码</el-button>
    </div>
    <div class="logout">
      <p>退出当前登陆账号</p>
      <el-button type="primary" size="small" @click="handleClickLogout">退出登陆</el-button>
    </div>
    <h4>版本更新</h4>
    <div class="version">
      <p>更新版本</p>
      <el-button type="primary" size="small" @click="handleClickVersion">检查更新</el-button>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, watch, onMounted } from 'vue'
import { setLocalStorage, getLocalStorage } from '@/utils/localStorage'
import { useRouter } from 'vue-router'

interface SettingFormData {
  openVideo: boolean,
  openMicrophone: boolean,
  themeValue: string,
  filePath: string
}

const router = useRouter()

const settingFormData = ref<SettingFormData>({
  openVideo: false,
  openMicrophone: false,
  themeValue: 'light',
  filePath: "/Users/xiaomodi/Desktop/前端/electron/video"
})

onMounted(() => {
  getSetting()
})

watch(() => settingFormData.value.themeValue, (newVal, oldVal) => {
  document.documentElement.setAttribute("theme", newVal)
  window.electron.ipcRenderer.invoke("theme-changed", newVal)
})

function handleClickChangeFilePath(): void {
  window.electron.ipcRenderer.invoke("change-file-path", {
    localFilePath: settingFormData.value.filePath
  }).then(path => {
    settingFormData.value.filePath = path
    handleSaveSetting()
  })
}

function handleClickOpenFilePath(): void {
  window.electron.ipcRenderer.invoke("open_file", {
    localFilePath: settingFormData.value.filePath
  })
}

function handleSaveSetting(): void {
  window.electron.ipcRenderer.invoke("setting-save", {...settingFormData.value})
} 

async function getSetting(): Promise<any> {
  const settingData = await window.electron.ipcRenderer.invoke("setting-get")
  settingFormData.value = settingData
}

function handleClickChangePassword() {
  console.log('handleClickChangePassword')
}

function handleClickLogout(): void {
  console.log("handleClickLogout", handleClickLogout)
  window.electron.ipcRenderer.invoke("logout")
  router.push("/")
}

function handleClickVersion() {
  console.log("handleClickVersion")
}

</script>

<style lang="scss" scoped>
.setting_wrapper {
  -webkit-app-region: no-drag;
  width: 100%;
  height: 100%;
  padding: 30px 20px 20px 20px;
  box-sizing: border-box;
  font-size: 14px;
  h4 {
    font-size: 16px;
    margin-bottom: 5px;
  }
  .open_video, .open_microphone, .toggle_theme {
    width: 100%;
    height: 35px;
    display: flex;
    align-items: center;
    &:deep(.el-checkbox__input) {
      margin-right: 6px;
    }
    p {
      margin-right: 6px;
    }
  }
  .toggle_theme {
    margin-bottom: 12px;
  }
  .record_wrapper {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .record_input {
      flex: 1;
      height: 30px;
      border: 1px solid var(--border-color-dark);
      margin: 0 10px;
      line-height: 30px;
      padding: 0 3px;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .possword, .logout, .version {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>