<template>
  <div class="footer">
    <div class="footer_item" :class="{ 'active': footerActive === 'audio'}" @click="handleClickItem('audio')">
      <span class="iconfont">&#xe65f;</span>
      <p>{{ baseInfo.micEnable && baseInfo.micOpen ? '静音' : '取消静音' }}</p>
    </div>
    <div class="footer_item" :class="{ 'active': footerActive === 'video'}" @click="handleClickItem('video')">
      <span class="iconfont">&#xe798;</span>
      <p>{{ baseInfo.cameraEnable && baseInfo.cameraOpen ? '关闭摄像头' : '开启摄像头' }}</p>
    </div>
    <div class="footer_item" :class="{ 'active': footerActive === 'share'}" @click="handleClickItem('share')">
      <span class="iconfont">&#xe798;</span>
      <p>{{ screenShare ? '取消共享' : '共享屏幕' }}</p>
    </div>
    <div class="footer_item" :class="{ 'active': footerActive === 'invite'}" @click="handleClickItem('invite')">
      <span class="iconfont">&#xe682;</span>
      <p>邀请</p>
    </div>
    <div class="footer_item" :class="{ 'active': footerActive === 'member'}" @click="handleClickItem('member')">
      <span class="iconfont">&#xe8cd;</span>
      <p>成员({{ totalMumber }})</p>
    </div>
    <div class="footer_item" :class="{ 'active': footerActive === 'chat'}" @click="handleClickItem('chat')">
      <el-badge :value="chat_number" :hidden="chat_number === 0" :max="99" class="item">
        <span class="iconfont chat">&#xe663;</span>
      </el-badge>
      <p>聊天</p>
    </div>
    <div class="footer_item" :class="{ 'active': footerActive === 'chat'}" @click="handleClickItem('chat')">
      <el-badge :value="chat_number" :hidden="chat_number === 0" :max="99" class="item">
        <span class="iconfont chat">&#xe663;</span>
      </el-badge>
      <p>退出会议</p>
    </div>
  </div>
  <Dialog v-model="shareScreenDialogVisible" title="选择要共享的屏幕" showFooter width="600" class="screen_share_dialog" @confirm="handleConfirmScreenShare">
    <div class="screen">
      <div class="screen_item" :class="{ active: selectScreen.id === item.id }" v-for="(item, index) in screenList" :key="index" @click="handleClickSelectItem(item)">
        <div class="screen_img">
          <img :src="item.thumbnail" alt="">
        </div>
        <div class="screen_name">
          {{ screenList.length > 1 ? item.name : '共享整个屏幕'}}
        </div>
      </div>
    </div>
    <el-divider></el-divider>
  </Dialog>
</template>

<script lang='ts' setup>
import { ref, onUnmounted, defineProps, defineEmits, onMounted, computed, toRaw } from 'vue'
import { openCamera, stopCamera } from '@/utils/media'
import Bus from '@/utils/eventBus'
import { type FooterActiveType, BaseInfo } from '../meeing_window_type'
import { useMeetingStore } from "@/store/useMeetingStore"
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Dialog } from '@/components'

const props = defineProps<{
  modelValue: string,
  baseInfo: BaseInfo
}>()

interface MapList {
  id: string,
  name: string,
  thumbnail: string,
  display_id: string
}

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'openCamera'): void
  (e: 'stopCamera'): void
}>()

const meetingStore = useMeetingStore()
const route = useRoute()
const footerActive = ref<FooterActiveType>("")
const screenShare = ref<boolean>(false)
// TODO 聊天数量的计算在会议03 6:45
const chat_number = ref<number>(0)
const shareScreenDialogVisible = ref<boolean>(false)
const screenList = ref<MapList[]>([])
const selectScreen = ref<MapList>({
  id: '',
  name: '',
  thumbnail: '',
  display_id: ''
})

onMounted(() => {
  getRouteQuery()
  getScreenList()
  Bus.on("cameraOpend", () => {
    if(screenShare.value && selectScreen.value.id) {
      ElMessage.success(`您已经取消 ${selectScreen.value.name} 的共享`)
      screenShare.value = false
      selectScreen.value.id = ""
      selectScreen.value.name = ""
      selectScreen.value.thumbnail = ""
      selectScreen.value.display_id = ""
      Bus.emit("shareSelectScreen", null)
      return
    }
  })
  Bus.on("screenOpend", () => {
    props.baseInfo.cameraOpen = false
  })
})

onUnmounted(() => {
  window.electron.ipcRenderer.removeAllListeners("get-screen-source")
})

const totalMumber = computed<number>(() => meetingStore.allMemberList.length)
/**
 * addType 0 不共享屏幕 1 共享屏幕
 */
function getRouteQuery(): void {
  const addType = route.query.addType as string
  addType == "1" ? screenShare.value = true : screenShare.value = false
}

function getScreenList() {
  window.electron.ipcRenderer.invoke("get-screen-source", {
    types: ["screen"],
    thumnailSize: {
      width: 170,
      height: 90
    },
    fetchWindowIcons: false
  }).then(res => {
    if (res.length) {
      screenList.value = res
      console.log("screenList.value", screenList.value)
    }
  }).catch(err => {
    console.log("err", err)
  })
}

function handleClickItem(key: string): void {
  footerActive.value = key as FooterActiveType
  emit("update:modelValue", key)
  switch(key) {
    case 'audio':
      handleClickMic()
      break;
    case 'video':
      handleClickCamera()
      break;
    case "share":
      handleClickShare()
      break;
  }
}
// 麦克风相关错做
function handleClickMic(): void {
  if (!props.baseInfo.micEnable) {
    ElMessage({
      message: '麦克风不可用',
      type: 'error',
    })
    return
  }
  props.baseInfo.micOpen = !props.baseInfo.micOpen
}

async function handleClickCamera(): Promise<any> {
// 当点击摄像头按钮 先判断当前摄像头是打开还是关闭状态
// 如果当前摄像头为打开状态，那么需要提示是否关闭摄像头，如果确定，则直接关闭摄像头，并将状态设置为关闭
// 如果当前摄像头为关闭状态
// 那么就判断当前摄像头是否可用
// 如果当前摄像头不可用，那么就提示用户摄像头不可用
// 如果当前摄像头可用，那么就打开摄像头 同时将当前摄像头状态改为打开, 并提示摄像头已经打开

  if(props.baseInfo.cameraOpen) {
    ElMessageBox.confirm("是否关闭摄像头？", "提示", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }).then(() => {
      emit("stopCamera")
      Bus.emit("stopCamera", false)
      props.baseInfo.cameraOpen = false
    })
  } else {
    const stream: MediaStream | null = await openCamera()
    if(!stream) {
      ElMessage({
        message: '摄像头不可用',
        type: 'error',
      })
      return
    } else {
      stream.getTracks().forEach(track => track.stop());
      ElMessageBox.confirm("是否打开摄像头？", "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      }).then(() => {
        emit("openCamera")
        Bus.emit("openCamera", true)
        props.baseInfo.cameraOpen = true
      }).catch(() => {
        emit("stopCamera")
        Bus.emit("stopCamera", false)
      })
    }
  }
}

function handleClickShare(): void {
  if(screenShare.value && selectScreen.value.id) {
    ElMessage.success(`您已经取消 ${selectScreen.value.name} 的共享`)
    screenShare.value = false
    selectScreen.value.id = ""
    selectScreen.value.name = ""
    selectScreen.value.thumbnail = ""
    selectScreen.value.display_id = ""
    Bus.emit("shareSelectScreen", null)
    return
  }
  shareScreenDialogVisible.value = !shareScreenDialogVisible.value
}

function handleClickSelectItem(screen: MapList): void {
  selectScreen.value = JSON.parse(JSON.stringify(toRaw(screen)))
}

function handleConfirmScreenShare(): void {
  if (!selectScreen.value.id) {
    ElMessage.error("请选择共享屏幕")
    return
  }
  ElMessage.success(`已经选择 ${selectScreen.value.name} 进行共享`)
  shareScreenDialogVisible.value = false
  screenShare.value = !screenShare.value
  Bus.emit("shareSelectScreen", selectScreen.value)
}


</script>

<style lang="scss" scoped>
.footer {
  width: 100%;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  .footer_item {
    width: 66px;
    height: 55px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 8px;
    border-radius: 3px;
    &:deep(.el-badge__content) {
      font-size: 10px;
      height: 15px;
    }
    &:hover {
      background-color: rgba(200,201,204, 0.5);
    }
    // &.active {
    //   background-color: rgba(200,201,204, 0.5);
    // }
    .iconfont {
      font-size: 18px;
      color: var(--icon-color);
      &.share {
        font-size: 16px;
      }
      &.chat {
        font-size: 16px;
      }
    }
    p {
      font-size: 12px;
      margin-top: 3px;
    }
  }
}
.screen_share_dialog {
  &:deep(.el-divider--horizontal) {
    margin: 0;
  }
}
.screen {
  width: 100%;
  max-height: 300px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  place-items: center;
  gap: 10px;
  margin: 10px 0;
  overflow-y: scroll;
  &:deep(.el-divider--horizontal) {
    margin: 0;
  }
  .screen_item {
    width: 170px;
    height: 120px;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color-dark);
    border-radius: 5px;
    overflow: hidden;
    &:hover {
      border: 1px solid var(--main-color);
      cursor: pointer;
    }
    &.active {
      border: 1px solid var(--main-color);
    }
    .screen_img {
      flex: 1;
      width: 100%;
      overflow: hidden;
      img {
        width: 100%;
        object-fit: fill;
      }
    }
    .screen_name {
      width: 100%;
      height: 30px;
      text-align: center;
      line-height: 30px;
      font-size: 13px;
      padding: 0 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>