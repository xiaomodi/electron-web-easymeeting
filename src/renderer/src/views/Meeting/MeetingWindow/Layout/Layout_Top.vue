<template>
  <div class="top_wrapper">
    <div class="top">
      <div class="top_user_item" :class="{ 'action': index === 0 }" v-for="(item, index) in mumberList" :key="index">
        <Avatar :userInfo="item" width="50px"/>
        <div class="user_name">
          <el-icon size="16" style="color: var(--main-color)"><User /></el-icon>
          <p>{{ item.nickName }}</p>
        </div>
      </div>
    </div>
    <div v-if="baseInfo.cameraEnable && baseInfo.cameraOpen" class="bottom">
     <div class="video_user_info">
        <div class="video_user_info_icon"><el-icon size="16"><User /></el-icon></div>
        <div class="video_user_info_text">{{ userInfo.nickName }}</div>
      </div>
      <video class="video_play" ref="videoRef" autoplay muted loop playsinline></video>
    </div>
    <div v-else class="bottom">
      <div class="bottom_user_item">
        <Avatar :userInfo="userInfo" width="60px"/>
        <div class="user_name">
          <el-icon size="18" style="color: var(--main-color)"><User /></el-icon>
          <p>{{ userInfo.nickName }}</p>
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
    // listenerMeetingMessage()
  }
})

</script>

<style lang="scss" scoped>
.top_wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .top {
    width: 100%;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    // overflow-x: scroll;
    .top_user_item {
      min-width: 120px;
      height: 120px;
      border: 2px solid var(--border-color-dark);
      border-radius: 7px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 10px;
      font-size: 14px;
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
  .bottom {
    width: 100%;
    flex: 1;
    border-top: 1px solid var(--border-color-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
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
    .bottom_user_item {
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
}
</style>