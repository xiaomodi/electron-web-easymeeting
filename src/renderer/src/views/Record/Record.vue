<template>
  <div v-if="RecordStatus.INIT === recordStatus" class="record_wrapper">
    <Setting @startRecord="startRecord" :disabled="!screenDisplayId"/>
    <Choice @displayId="displayId" @screenIndex="screenIndex"/>
  </div>
  <div v-else class="record_wrapper_record">
    <div v-if="RecordStatus.START === recordStatus" class="record_start">
      <el-icon class="is-loading loading" size="20">
        <Loading />
      </el-icon>
      开始录制中，请稍后......
    </div>
    <div v-if="RecordStatus.RECORDING === recordStatus" class="record_recording">
      <div class="record_time">
        录制中：{{ formatTime }}
      </div>
      <div class="stop_btn" :class="{ 'disabled' : stopDisabled }" @click="handleClickStop">
        <img class="stop_icon" src="./image/stop_record.png" alt="">
        停止录制
      </div>
    </div>
    <div v-if="RecordStatus.STOPPING === recordStatus" class="record_stopping">
      <el-icon class="is-loading loading" size="20">
        <Loading />
      </el-icon>
      停止录制中，请稍后......
    </div>
    <div v-if="RecordStatus.STOP === recordStatus" class="record_stop">
      <div class="record_filePath">
         <el-tooltip
          class="box-item"
          effect="dark"
          :content="filePath"
          placement="top"
        >
          <div class="file_input">{{ filePath }}</div>
        </el-tooltip>
        <div class="content" @click="handleClickOpenFile">
          <img class="open_file_icon" src="./image/open_file.png" alt="" >
          <span class="text">打开文件</span>
        </div>
      </div>
      <div class="record_btn">
        <el-button type="primary" :icon="ArrowLeft" @click="handleClickReStart">继续录制</el-button>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Loading, ArrowLeft } from "@element-plus/icons-vue"
import Setting from './components/Record_Setting/Record_Setting.vue'
import Choice from './components/Record_Choice/Record_Choice.vue'

// 录制状态：
// 0: 初始化
// 1: 开始录制
// 2: 录制中
// 3: 停止录制中
// 4: 停止录制
enum RecordStatus {
  INIT = 0,
  START = 1,
  RECORDING = 2,
  STOPPING = 3,
  STOP = 4
}
const recordStatus = ref<number | string>(0)
const recordTime = ref<number>(0)
const filePath = ref<string>("")
const stopDisabled = ref<boolean>(true)
const screenDisplayId = ref<string>("")
const screen_index = ref<number>(0)

onMounted(() => {
  listenRecordTime()
})

const formatTime = computed<string>(() => {
  const hour: string = addZero(Math.floor(recordTime.value / 3600))
  const minute: number = addZero(Math.floor((recordTime.value - hour * 3600) / 60))
  const second: number = addZero(Math.floor(recordTime.value - hour * 3600 - minute * 60))
  return `${hour}:${minute}:${second}`;
})

function addZero(t: number): string {
  if (!t) return "00"
  return `0${t}`.slice(-2)
}

function displayId(id: string): void {
  screenDisplayId.value = id
}

function screenIndex(_screenIndex: number): void {
  screen_index.value = _screenIndex
}

function startRecord(status: number): void {
  recordStatus.value = status
  window.electron.ipcRenderer.invoke("start_record", {
    displayId: screenDisplayId.value, // 屏幕display_id
    mic: "", // 是否打开麦克风
    screenIndex: screen_index.value, // 屏幕索引
  })
}

function handleClickStop(): void {
  if (stopDisabled.value) return
  window.electron.ipcRenderer.invoke("stop_record")
  recordStatus.value = 3
}

function handleClickOpenFile(): void {
  window.electron.ipcRenderer.invoke("open_file", {localFilePath: filePath.value})
}

function handleClickReStart(): void {
  recordStatus.value = 0
  recordTime.value = 0
  screen_index.value = 0
  screenDisplayId.value = ""
  filePath.value = ""
}

function listenRecordTime(): void {
  // 监听渲染进程发送的时间
  window.electron.ipcRenderer.on("record-time", (event, _recordTime: number) => {
    recordStatus.value = recordStatus.value === 3 ? 3 : 2
    recordTime.value = _recordTime
    if (recordTime.value >= 3) {   // 点击录制后不能立即结束，需要等待3秒，如果立即结束文件会出现问题
      stopDisabled.value = false
    }
  })
  // 监听渲染进程完成录制后发送的文件路径
  window.electron.ipcRenderer.on("finish-recording", (e, _filePath: string) => {
    recordStatus.value = 4
    filePath.value = _filePath
    stopDisabled.value = true
  })
}

</script>

<style lang="scss" scoped>
.record_wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  padding-top: 30px;
  box-sizing: border-box;
}
.record_wrapper_record {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .record_start, .record_stopping {
    display: flex;
    .loading {
      margin-right: 10px;
    }
  }
  .record_recording {
    -webkit-app-region: no-drag;
    display: flex;
    flex-direction: column;
    align-items: center;
    .record_time {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 28px;
    }
    .stop_btn {
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      color: #d81e06;
      opacity: 1;
      cursor: pointer;
      &.disabled {
        opacity: 0.5;
      }
      .stop_icon {
        width: 50px;
        height: 50px;
        margin-right: 10px;
      }
    }
  }
  .record_stop {
    -webkit-app-region: no-drag;
    .record_filePath {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      .file_input {
        width: 300px;
        height: 30px;
        border: 1px solid var(--border-color-dark);
        font-size: 14px;
        line-height: 30px;
        padding: 0 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 18px;
      }
      .content {
        display: flex;
        align-items: center;
        .open_file_icon {
          width: 28px;
          margin-right: 8px;
        }
        .text {
          font-size: 14px;
        }
      }
    }
  }
}
</style>