<template>
  <el-popover ref="popoverRef" :visible="visible" :effect="effect">
    <template #reference>
      <div class="changeLayout" @click="handleClickToggle" v-click-outside="onClickOutside">
        <img v-if="effect === 'light'" class="icon" src="../../iconfont/layout-2-fill-black.png" alt="" />
        <img v-else class="icon" src="../../iconfont/layout-2-fill.png" alt="" />
        <p>切换布局</p>
        <el-icon><ArrowDown /></el-icon>
      </div>
    </template>
    <div class="layout_body">
      <div class="layout_item" @click="handleClickItem('GRID')">
        <div class="layout_icon_grid"></div>
        <span>宫格布局</span>
      </div>
      <div class="layout_item" @click="handleClickItem('TOP')">
        <div class="layout_icon_top"></div>
        <span>顶部缩略图</span>
      </div>
      <div class="layout_item" @click="handleClickItem('RIGHT')">
        <div class="layout_icon_right"></div>
        <span>侧边缩略图</span>
      </div>
    </div>
  </el-popover>
</template>

<script lang='ts' setup>
import { ref, reactive, defineProps, withDefaults, defineEmits } from 'vue'
import { Layout } from '../type' 
import type { PopoverInstance } from 'element-plus'
import { ClickOutside as vClickOutside } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

withDefaults(defineProps<{
  effect: string,
  modelValue: Layout,
}>(), {
  effect: 'light'
})


const visible = ref<boolean>(false)
const popoverRef = ref<PopoverInstance>()

const emit = defineEmits<{
  (e: "update:modelValue", value: Layout): void
}>()

const onClickOutside = (): void => {
  popoverRef.value?.hide()
  visible.value = false
}

function handleClickItem(type: string): void {
  visible.value = false
  emit("update:modelValue", type as Layout)
}

function handleClickToggle(): void {
  visible.value = !visible.value
}
</script>

<style lang="scss" scoped>
.changeLayout {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 15px;
  border-right: 1px solid var(--border-color-dark);
  .icon {
    width: 18px;
    height: 18px;
    margin-right: 5px;
  }
  p {
    margin-right: 5px;
  }
}
.layout_body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  .layout_item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5px;
    .layout_icon_grid {
      width: 70px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      background: url("../../iconfont/layout-grid-fill.png");
      background-repeat: no-repeat;
      background-position: center;
      background-size: 82px;
      margin-bottom: 8px;
      &:hover {
        background: url("../../iconfont/layout-grid-fill-hover.png");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 82px;
        border: 2px solid var(--main-color);
        cursor: pointer;
      }
    }
    .layout_icon_top {
      width: 70px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      background: url("../../iconfont/layout-2-fill.png");
      background-repeat: no-repeat;
      background-position: center;
      background-size: 82px;
      margin-bottom: 8px;
      transform: rotate(90deg);
      &:hover {
        background: url("../../iconfont/layout-2-fill-hover.png");
         background-repeat: no-repeat;
        background-position: center;
        background-size: 82px;
        border: 2px solid var(--main-color);
        cursor: pointer;
      }
    }
    .layout_icon_right{
      width: 70px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      background: url("../../iconfont/layout-4-fill.png");
      background-repeat: no-repeat;
      background-position: center;
      background-size: 82px;
      margin-bottom: 8px;
      &:hover {
        background: url("../../iconfont/layout-4-fill-hover.png");
         background-repeat: no-repeat;
        background-position: center;
        background-size: 82px;
        border: 2px solid var(--main-color);
        cursor: pointer;
      }
    }
  }
}
</style>