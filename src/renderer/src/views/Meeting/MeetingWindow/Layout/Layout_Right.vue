<template>
  <div class="right_wrapper">
    <div v-if="baseInfo.cameraEnable && baseInfo.cameraOpen" class="right_left">
      <div class="video_user_info">
        <div class="video_user_info_icon"><el-icon size="16"><User /></el-icon></div>
        <div class="video_user_info_text">{{ userInfo.nickName }}</div>
      </div>
      <video class="video_play" ref="videoRef" autoplay muted loop playsinline></video>
    </div>
    <div v-else class="right_left">
      <div class="right_user_item">
        <Avatar :userInfo="userInfo" width="60px"/>
        <div class="user_name">
          <el-icon size="18" style="color: var(--main-color)"><User /></el-icon>
          <p>{{ userInfo.nickName }}</p>
        </div>
      </div>
    </div>

    <div class="right_right">
      <div class="right_user_item" :class="{ 'action': index === 0 }" v-for="(item, index) in mumberList" :key="index">
        <Avatar :userInfo="item" width="50px"/>
        <div class="user_name">
          <el-icon size="16" style="color: var(--main-color)"><User /></el-icon>
          <p>{{ item.nickName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, watchEffect, defineProps } from 'vue'
import { type UserInfo } from '@/store/userInfo'
import { type BaseInfo } from '../meeing_window_type'
import { User } from '@element-plus/icons-vue'
import { usePublicMethod, type VideoRef } from './public'
import Avatar from '@/components/Avatar/Avatar.vue'

const props = defineProps<{
  baseInfo: BaseInfo,
  userInfo: UserInfo,
  screenId: string
}>()

const videoRef = ref<VideoRef>(null)
const memberVideoRef = ref<VideoRef>(null)

const { mumberList, allMemberList, initVideo, listenerMeetingMessage } = usePublicMethod(props, videoRef)

watchEffect(() => {
  if (videoRef.value) {
    initVideo()
    listenerMeetingMessage()
  }
})

</script>

<style lang="scss" scoped>
.right_wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  .right_left {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid var(--border-color-dark);
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
    .right_user_item {
      width: 120px;
      height: 120px;
      border-radius: 7px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 10px;
      font-size: 14px;
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
  .right_right {
    width: 150px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    // justify-content: center;
    overflow-y: scroll;
    .right_user_item {
      width: 120px;
      min-height: 120px;
      border: 2px solid var(--border-color-dark);
      border-radius: 7px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 6px 0;
      font-size: 14px;
      flex-shrink: 1;
      &.action {
        border: 2px solid var(--main-color);
      }
      .user_name {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        margin-top: 8px;
        p {
          margin-left: 2px;
        }
      }
    }
  }
}
</style>