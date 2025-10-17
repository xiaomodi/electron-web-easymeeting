<template>
  <div class="back_wrapper">
    <div class="back_icon" @click="handleClickBack">
      <el-icon><ArrowLeftBold /></el-icon>
    </div>
    <div class="back_title">{{ title }}</div>
    <div class="back_icon"></div>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, defineEmits, defineProps, withDefaults } from 'vue'
import { ArrowLeftBold } from '@element-plus/icons-vue'

// const emit = defineEmits()<{
//   (e: 'back'): void
// }>

withDefaults(defineProps<{
  title: string,
}>(), {
  title: "默认标题"
})

const emit = defineEmits(['back']) // 无参数简易写法

const handleClickBack = ():void => {
  emit("back")
}

</script>

<style lang="scss" scoped>
.back_wrapper {
  width: 100%;
  height: 30px;
  padding: 0 13px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  // margin-bottom: 20px;
  .back_icon {
    flex: 1;
    display: flex;
    align-items: center;
  }
  .back_title {
    flex: 8;
    font-weight: 600;
    font-size: 19px;
    text-align: center;
  }
}
</style>