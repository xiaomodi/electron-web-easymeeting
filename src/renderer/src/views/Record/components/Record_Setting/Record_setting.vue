<template>
  <div class="record_setting_wrapper">
    <h4 class="title">录制设置</h4>
    <div class="setting_content">
      <div class="mic_item" v-for="(item, index) in micList" :key="index">
        <MicrophoneIcon color="#fff" style="margin-right: 10px"/>
        <div class="mic_name">
          {{ getLabelName(item.label) }}
        </div>
      </div>
    </div>
    <el-button type="primary" size="large" :disabled="disabled" @click="handleClickStartRecord">开始录制</el-button>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, defineEmits, defineProps, withDefaults, onMounted } from 'vue'
import MicrophoneIcon from '@/components/MicrophoneIcon/MicrophoneIcon.vue'

withDefaults(defineProps<{
  disabled: boolean,
}>(), {
  disabled: true,
})

const micInfoRef = ref<HTMLElement | null>(null)
const micInfo = reactive({})
const micList = reactive<MediaDeviceInfo[]>([])

onMounted(() => {
  getMicList()
})

function getMicList(): void {
  navigator.mediaDevices.enumerateDevices().then(devices => {
    const list = devices.find(device => {
      device.kind === 'audioinput' && device.deviceId === 'default'
      return device
    })
    micList.push(list!)
  })
}

function getLabelName(label: string): string {
  return label.split("-").length > 1 ? label.split("-")[1] : label
}


const emit = defineEmits<{
  (e: 'startRecord', value: number): void
}>()

function handleClickStartRecord(): void {
  emit("startRecord", 1)
}

</script>

<style lang="scss" scoped>
.record_setting_wrapper {
  -webkit-app-region: no-drag;
  flex: 4;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .title {
    margin-bottom: 10px;
  }
  .setting_content {
    width: 100%;
    flex: 1;
    margin-bottom: 10px;
    overflow: hidden;
    .mic_item {
      width: 100%;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .mic_name {
        flex: 1;
        min-width: 1px;
        font-size: var(--font-size-medium);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-right: 5px;
        box-sizing: border-box;
      }
    }
  }
}
</style>