<template>
  <div class="microphone_icon_wrapper" @click="handleClickOpenOrClose">
    <div v-if="isOpen" class="allow">
      <svg class="allow_icon" viewBox="0 0 24 24" width="25" height="25">
        <!-- <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/> -->
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
      <div class="jump_icon">
        <div class="wave" :style="{transform: `translateY(${volume}px)`}"></div>
      </div>
    </div>
    <div v-else class="forbid">
      <svg class="forbid_icon" viewBox="0 0 24 24"  width="25" height="26">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        <line x1="6" y1="6" x2="18" y2="18" stroke="#ff4444" stroke-width="2" style="color: white;"/>
      </svg>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, defineProps, defineExpose, withDefaults, onMounted } from 'vue'
import { initMicrophone, volume, closeMicrophone } from './microphone'

withDefaults(defineProps<{
  color: string
}>(), {
  color: "#fff"
})

const isOpen = ref<boolean>(false)


function handleClickOpenOrClose(): void {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    initMicrophone()
  } else {
    closeMicrophone()
  }
}

defineExpose({
  handleClickOpenOrClose
})


</script>

<style lang="scss" scoped>
.microphone_icon_wrapper {
  -webkit-app-region: no-drag;
  width: 40px;
  height: 40px;
  position: relative;
  border-radius: 50%;
  background: #515c67;
  .allow, .forbid {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .allow_icon, .forbid_icon {
      fill: v-bind(color);
    }
  }
  .jump_icon {
    position: absolute;
    top: 9px;
    left: 50%;
    transform: translateX(-50%);
    width: 5.5px;
    height: 13px;
    background: v-bind(color);
    border-radius: 6px;
    overflow: hidden;
    z-index: 10;
    .wave {
      width: 100%;
      height: 13px;
      background: var(--main-color);
      transform: translateY(13px); // 区间范围是0-14
    }
  }
}

</style>