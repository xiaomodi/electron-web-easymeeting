<template>
  <!-- <img v-if="userInfo.userId" :src="userInfo.userId" class="user_icon image" alt=""> -->
  <div class="user_icon none">{{ userInfo.nickName.slice(0, 1) }}</div>
</template>

<script lang='ts' setup>
import { ref, reactive, defineProps, withDefaults, computed } from 'vue'

interface UserInfo {
  nickName: string,
  userId: string | undefined,
}
const props = withDefaults(defineProps<{
  userInfo: any,
  width?: string | number
}>(), {
  width: '40px'
})

const fontSize = computed<string>(() => {
  const matchs = props.width.toString().match(/\d+/g)
  if (matchs && matchs.length > 0) {
    return `${+matchs[0] * 0.45}px`
  }
  return '18px'
})

const width = computed<string>(() => {
  return props.width.toString()
})


</script>

<style lang="scss" scoped>
.user_icon {
  width: v-bind(width);
  height: v-bind(width);
  border-radius: 50%;
  &.image {
    border: 1px solid var(--background-color-light);
  }
  &.none {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: v-bind(fontSize);
    color: #fff;
    background: orange;
  }
}
</style>