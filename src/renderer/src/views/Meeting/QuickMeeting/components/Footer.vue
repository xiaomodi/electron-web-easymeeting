<template>
  <div class="footer">
    <div class="footer_item" :class="{ 'active': footerActive === 'audio'}" @click="handleClickItem('audio')">
      <span class="iconfont">&#xe65f;</span>
      <p>{{ baseInfo.micEnable && baseInfo.micOpen ? '静音' : '取消静音' }}</p>
    </div>
    <div class="footer_item" :class="{ 'active': footerActive === 'video'}" @click="handleClickItem('video')">
      <span class="iconfont">&#xe798;</span>
      <p>{{ baseInfo.cameraEnable && baseInfo.cameraOpen ? '关闭视频' : '开启视频' }}</p>
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
      <p>成员</p>
    </div>
    <div class="footer_item" :class="{ 'active': footerActive === 'chat'}" @click="handleClickItem('chat')">
      <el-badge :value="chat_number" :hidden="chat_number === 0" :max="99" class="item">
        <span class="iconfont">&#xe663;</span>
      </el-badge>
      <p>聊天</p>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, defineProps, defineEmits, onMounted } from 'vue'
import { type FooterActiveType, BaseInfo } from '../type'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: string,
  baseInfo: BaseInfo
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'openCamera'): void
  (e: 'stopCamera'): void
}>()

const route = useRoute()
const footerActive = ref<FooterActiveType>("")
const screenShare = ref<boolean>(false)
// TODO 聊天数量的计算在会议03 6:45
const chat_number = ref<number>(0)

onMounted(() => {
  getRouteQuery()
})
/**
 * addType 0 不共享屏幕 1 共享屏幕
 */
function getRouteQuery(): void {
  const addType = route.query.addType as string
  addType == 1 ? screenShare.value = true : screenShare.value = false
}

function handleClickItem(key: string): void {
  footerActive.value = key
  emit("update:modelValue", key)
  switch(key) {
    case 'audio':
      handleClickMic()
      break;
    case 'video':
      handleClickCamera()
      break;
  }
}
// 麦克风相关错做
function handleClickMic(): void {
  if (!props.baseInfo.micEnable) {
    return ElMessage({
      message: '麦克风不可用',
      type: 'error',
    })
  }
  props.baseInfo.micOpen = !props.baseInfo.micOpen
}
function handleClickCamera(): void {
  if (!props.baseInfo.cameraEnable) {
    return ElMessage({
      message: '摄像头不可用',
      type: 'error',
    })
  }
  props.baseInfo.cameraOpen = !props.baseInfo.cameraOpen
  if (props.baseInfo.cameraOpen) {
    emit("openCamera")
  } else {
    emit("stopCamera")
  }
  
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
    margin: 0 10px;
    border-radius: 5px;
    &:deep(.el-badge__content) {
      font-size: 10px;
      height: 15px;
    }
    &.active {
      background-color: rgba(200,201,204, 0.5);
    }
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
</style>