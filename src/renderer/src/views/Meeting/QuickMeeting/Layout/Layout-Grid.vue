<template>
  <div class="grid_wrapper">
    <!-- 默认成员列表中第一个是自己 -->
    <div class="grid_item myself">
      <!-- 有摄像头的时候 -->
      <div v-if="baseInfo.cameraEnable && baseInfo.cameraOpen" class="grid_item_myself_video">
        <div class="video_user_info">
          <el-icon size="18" style="color: var(--main-color)"><User /></el-icon>
          <p>{{ userInfo.nickName }}</p>
        </div>
        <video class="video_play" ref="videoRef" autoplay muted loop playsinline></video>
      </div>
      <!-- 没有摄像头的时候 -->
       <div v-else class="grid_item_myself_no_video">
        <Avatar :userInfo="userInfo" width="60px"/>
        <div class="user_name">
          <el-icon size="18" style="color: var(--main-color)"><User /></el-icon>
          <p>{{ userInfo.nickName }}</p>
        </div>
       </div>
    </div>
    <div v-for="item in mumberList" class="grid_item">
      <Avatar :userInfo="item" width="60px"/>
      <div class="user_name">
        <el-icon size="18" style="color: var(--main-color)"><User /></el-icon>
        <p>{{ item.nickName }}</p>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, defineProps, computed, onMounted, defineExpose } from 'vue'
import { type BaseInfo } from '../type'
import { type UserInfo } from '@/store/userInfo'
import { initStream } from '@/utils/media'
import { User } from '@element-plus/icons-vue'
import Avatar from '@/components/Avatar/Avatar.vue'

const props = defineProps<{
  mumberList: number,
  baseInfo: BaseInfo,
  userInfo: userInfo,
  screenId: string
}>()

const MAX_LENGTH = 30
const videoRef = ref<HTMLMediaElement>(null)

onMounted(() => {
  initVideo()
})

const columns = computed<number>(() => {
  const column = Math.ceil(Math.sqrt(props.mumberList.length))
  return column
})

function initVideo() {
  initStream(props.baseInfo.micEnable, props.baseInfo.cameraEnable, props.baseInfo.micOpen, props.baseInfo.cameraOpen, props.screenId).then(stream => {
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
  })
  //TODO 加入视频会议
}

defineExpose({
  initVideo
})

</script>

<style lang="scss" scoped>
.grid_wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(v-bind(columns), 1fr);
  grid-auto-rows: 1fr;
  gap: 10px;
  overflow-y: scroll;
  padding: 10px;
  box-sizing: border-box;
  .grid_item {
    border: 1px solid var(--border-color-dark);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    .grid_item_myself_video {
      width: 100%;
      height: 100%;
      position: relative;
      .video_user_info {
        position: absolute;
        top: 5px;
        right: 5px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 14px;
        p {
          margin-left: 2px;
        }
      }
      .video_play {
        width: 100%;
        height: 100%;
        transform: scaleX(-1);
      }
    }
    .grid_item_myself_no_video {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .user_name {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        margin-top: 8px;
        p {
          margin-left: 2px;
        }
      }
    }
    .user_name {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      margin-top: 8px;
      p {
        margin-left: 2px;
      }
    }
  }
}
</style>