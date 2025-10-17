<template>
  <div class="right_wrapper">
    <div class="right_left">
      <div class="right_user_item">
        <Avatar :userInfo="mumberList[0]" width="60px"/>
        <div class="user_name">
          <el-icon size="18" style="color: var(--main-color)"><User /></el-icon>
          <p>{{ mumberList[0].nickName }}</p>
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
import { ref, reactive, defineProps } from 'vue'
import { User } from '@element-plus/icons-vue'
import Avatar from '@/components/Avatar/Avatar.vue'

const props = defineProps<{
  mumberList: number
}>()

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