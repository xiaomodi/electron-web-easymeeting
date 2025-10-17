<template>
  <div class="record_choice_wrapper">
    <h4 class="title">选择录制屏幕</h4>
    <div class="choice_content">
      <div class="choice_item" 
        v-for="(item, index) in screenSource"
        :class="{'action' : index === action }"
        @click="handleClickItem(item, index)" :key="item.id">
        <div class="choice_item_top">
          <img class="screen_img" :src="item.thumbnail" alt="">
        </div>
        <div class="choice_item_info">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, onMounted, defineEmits } from 'vue'

interface MapList {
  id: string,
  name: string,
  thumbnail: string,
  display_id: string
}

const screenSource = reactive<MapList[]>([]) // 获取屏幕数量
const action = ref<number | null>(null)

onMounted(() => {
  getScreenSource()
})

const emit = defineEmits<{
  (e: "displayId", id: string): void
  (e: 'screenIndex', index: number): void
}>()

function getScreenSource(): void {
  window.electron.ipcRenderer.invoke("get-screen-source", {
    types: ["screen"], // "screen", "window"
    thumnailSize: { // 缩略图大小
      width: 170,
      height: 90
    },
    fetchWindowIcons: false // 获取窗口图标
  }).then(result => {
    screenSource.push(...result)
  })
}

function handleClickItem(item: Element, index: number): void {
  action.value = index
  emit('displayId', item.display_id)
  emit("screenIndex", index + 1)
}

</script>

<style lang="scss" scoped>
.record_choice_wrapper {
  -webkit-app-region: no-drag;
  flex: 6;
  height: 100%;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  background: var(--menu-background-color);
  .title {
    margin-bottom: 10px;
  }
  .choice_content {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 10px;
    overflow-y: scroll;
    .choice_item {
      aspect-ratio: 16 / 11;
      // height: 135px;
      display: flex;
      flex-direction: column;
      border-radius: 5px;
      border: 2px solid var(--background-color-dark);
      box-sizing: border-box;
      &:hover {
        border: 2px solid var(--main-color);
        color: var(--main-color);
      }
      &.action {
        border: 2px solid var(--main-color);
        color: var(--main-color);
      }
      .choice_item_top {
        width: 100%;
        flex: 0 0 100px;
        overflow: hidden;
        .screen_img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
      }
      .choice_item_info {
        width: 100%;
        line-height: 30px;
        text-align: center;
        font-size: 13px;
      }
    }
  }
}
</style>