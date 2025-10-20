<template>
  <img v-if="userInfo.userId" :src="userInfo.userId" class="user_icon image" alt="">
  <div v-else class="user_icon none">{{ userInfo.nickName.substring(0, 1) }}</div>
</template>

<script lang='ts' setup>
import { ref, reactive, defineProps, withDefaults } from 'vue'

interface UserInfo {
  nickName: string,
  userId: string | undefined,
}
const props = withDefaults(defineProps<{
  userInfo: UserInfo,
  width?: string | number
}>(), {
  width: '40px'
})


</script>

<style lang="scss" scoped>
.user_icon {
  width: v-bind(width);
  height: v-bind(width);
  border-radius: 50%;
  margin-right: 20px;
  &.image {
    border: 1px solid var(--background-color-light);
  }
  &.none {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #fff;
    background: skyblue;
  }
}
</style>