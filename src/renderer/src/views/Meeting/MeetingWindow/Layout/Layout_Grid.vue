<template>
  <div v-loading="!columns" class="grid_wrapper">
    <!-- 默认成员列表中第一个是自己 -->
    <div class="grid_item myself">
      <!-- 有摄像头的时候 -->
      <div v-show="(baseInfo.cameraEnable && baseInfo.cameraOpen) || (props.screenId || screenId)" class="grid_item_myself_video">
        <div class="video_user_info">
          <div class="video_user_info_icon"><el-icon size="16"><User /></el-icon></div>
          <div class="video_user_info_text">{{ userInfo.nickName }}</div>
        </div>
        <video class="video_play" ref="videoRef" autoplay muted loop playsinline></video>
      </div>
      <!-- 没有摄像头的时候 -->
       <div v-show="!((baseInfo.cameraEnable && baseInfo.cameraOpen) || (props.screenId || screenId))" class="grid_item_myself_no_video">
        <Avatar :userInfo="userInfo" width="60px"/>
        <div class="user_name">
          <el-icon size="18" style="color: var(--main-color)"><User /></el-icon>
          <p>{{ userInfo.nickName }}</p>
        </div>
       </div>
    </div>
    <!-- 会议中其他成员 -->
    <div v-for="item in mumberList" class="grid_item">
      <div v-show="item.openVideo" class="grid_item_member_hasVideo">
        <div class="video_user_info">
          <div class="video_user_info_icon"><el-icon size="16"><User /></el-icon></div>
          <div class="video_user_info_text">{{ item.nickName }}</div>
        </div>
        <video :id="`member_${item.userId}`" class="video_play" ref="memberVideoRef" autoplay muted loop playsinline></video>
      </div>
      <div v-show="!item.openVideo" class="grid_item_member_noVideo">
        <Avatar :userInfo="item" width="60px"/>
        <div class="user_name">
          <el-icon size="18" style="color: var(--main-color)"><User /></el-icon>
          <p>{{ item.nickName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, defineProps, computed, defineExpose, watchEffect } from 'vue'
import { type BaseInfo } from '../meeing_window_type'
import { type UserInfo } from '@/store/userInfo'
import { useMeetingStore, type NewUser } from '@/store/useMeetingStore'
import { User } from '@element-plus/icons-vue'
import { usePublicMethod, type VideoRef } from './public'
import Avatar from '@/components/Avatar/Avatar.vue'

const props = defineProps<{
  baseInfo: BaseInfo,
  userInfo: UserInfo,
  screenId: string
}>()

// const MAX_LENGTH = 
const meetingStore = useMeetingStore()
const videoRef = ref<VideoRef>(null)
const memberVideoRef = ref<VideoRef>(null)

const { mumberList, initVideo, screenId } = usePublicMethod(props, videoRef)

watchEffect(() => {
  if (videoRef.value) {
    initVideo()
  }
})

const columns = computed<number>(() => {
  const column = Math.ceil(Math.sqrt(meetingStore.allMemberList.length))
  return column
})

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
    border-radius: 5px;
    .grid_item_myself_video, .grid_item_member_hasVideo {
      width: 100%;
      height: 100%;
      position: relative;
      .video_user_info {
        max-width: 80px;
        height: 20px;
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        font-size: 12px;
        z-index: 100;
        background: var(--meeting-username-bg);
        color: var(--meeting-username-color);
        padding-right: 2px;
        .video_user_info_icon {
          flex: 0 0 20px;
          height: 20px;
          background-color: var(--main-color);
          margin-right: 5px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .video_user_info_text {
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .video_play {
        width: 100%;
        height: 100%;
        transform: scaleX(-1);
      }
    }
    .grid_item_myself_no_video, .grid_item_member_noVideo {
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
        margin-left: 3px;
      }
    }
  }
}
</style>