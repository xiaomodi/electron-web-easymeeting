<template>
  <div class="dialog_wrapper">
    <el-dialog
      :model-value="modelValue"
      :show-close="showClose"
      :title="title"
      :width="width"
      :before-close="handleClose"
      :draggable="draggable"
    >
     <el-divider />
     <div class="dialog_content">
        <slot></slot>
     </div>
      <template #footer>
        <div v-if="showFooter" class="dialog-footer">
          <slot name="footer">
            <el-button @click="handleClose">{{ footerCancelText }}</el-button>
            <el-button type="primary" @click="handleClickConfirm" :disabled="confirmBtnDisable">{{ footerConfirmText }}</el-button>
          </slot>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, defineProps, withDefaults, defineEmits } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean, // 是否显示
  confirmBtnDisable?: boolean, // 确定按钮是否禁用
  showClose?: boolean,
  title?: string,
  width?: string,
  showFooter?: boolean,
  footerCancelText?: string,
  footerConfirmText?: string,
  draggable?: boolean,
  close?: (...args: any[]) => void
}>(), {
  title: 'titles',
  showClose: true,
  width: '500',
  showFooter: false,
  footerCancelText: '取消',
  footerConfirmText: '确定',
  draggable: false,
  confirmBtnDisable: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

function handleClose(): void {
  emit("update:modelValue", false)
  props.close?.()
}

function handleClickConfirm(): void {
  emit("confirm")
}

</script>

<style lang="scss" scoped>
.dialog_wrapper {
  &:deep(.el-dialog) {
    margin: 0 !important;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0;
  }
  &:deep(.el-overlay ,el-modal-dialog) {
    -webkit-app-region: no-drag;
  }
  &:deep(.el-dialog__header) {
    padding-bottom: 10px;
  }
  &:deep(.el-divider--horizontal) {
    margin: 0 0 10px 0;
  }
  &:deep(.el-dialog__title) {
    display: block;
    margin: 10px 0 0 10px;
  }
  &:deep(.el-dialog__footer) {
    padding: 10px 15px;
  }
  .dialog_content {
    width: 100%;
    height: 100%;
  }
}
</style>