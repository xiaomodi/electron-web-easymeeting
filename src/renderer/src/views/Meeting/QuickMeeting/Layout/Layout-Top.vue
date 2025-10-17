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
    <div class="bottom">
      <div class="bottom_user_item">
        <Avatar :userInfo="mumberList[0]" width="60px"/>
        <div class="user_name">
          <el-icon size="18" style="color: var(--main-color)"><User /></el-icon>
          <p>{{ mumberList[0].nickName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, defineProps } from 'vue'
import { User } from '@element-plus/icons-vue'
import Avatar from '@/components/Avatar/Avatar.vue'

const props = defineProps<{
  mumberList: number
}>()

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