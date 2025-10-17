<template>
  <div class="wrapper">
    <div class="meeting_left_content_item" @mouseover="handleOnmouseOver('add')" @mouseleave="handleOnmouseLeave('add')" @click="handleClickJoinMeeting">
      <div class="meeting_left_content_item_icon">
        <img v-show="addAction" src="../iconfont/jiaruhuiyi1.png" alt="">
        <img v-show="!addAction" src="../iconfont/tengxunhuiyi.png" alt="">
      </div>
      加入会议
    </div>
    <Dialog v-model="joinMeetingDialog" title="加入会议" width="450" showFooter>
      <div class="dialog_body">
        <div class="dialog_item">
          <div class="label necessary">会议号</div>
          <div class="content">
            <el-input v-model="formData.meetingId" placeholder="请输入会议号" clearable/>
          </div>
        </div>
        <div class="dialog_item">
          <div class="label necessary">您的名称</div>
          <div class="content">
            <el-input v-model="formData.meetingName" placeholder="请输入会议号" clearable/>
          </div>
        </div>
        <div class="dialog_item">
          <div class="label">会议密码</div>
          <div class="content">
            <el-radio-group v-model="joinMeetingType">
              <el-radio value="0">免密入会</el-radio>
              <el-radio value="1">密码入会</el-radio>
            </el-radio-group>
          </div>
        </div>
         <div class="dialog_item" v-show="joinMeetingType == '1'">
          <div class="label"></div>
          <div class="content">
            <el-input v-model="formData.meetingPassword" placeholder="请输入会议密码" clearable/>
          </div>
        </div>
      </div>
      <el-divider />
      <template #footer>
        <el-button type="primary" :disabled="disabled" @click="handleClickJoinMeetingRoom">加入会议</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, computed } from 'vue'
import { Dialog } from '@/components'

interface FormData {
  meetingId: string,
  meetingName: string,
  meetingPassword?: string,
}

const addAction = ref<boolean>(false)
const joinMeetingDialog = ref<boolean>(false)
const joinMeetingType = ref<string>("0")
const formData = reactive({
  meetingId: "",
  meetingName: "",
  meetingPassword: "",
})

const disabled = computed<boolean>(() => {
  if(!formData.meetingId.length || !formData.meetingName.length) return true
  return false
})

function handleOnmouseOver(item: string): void {
  addAction.value = true;
}

function handleOnmouseLeave(item: string):void {
  addAction.value = false;
}

function handleClickJoinMeeting(): void {
  joinMeetingDialog.value = true
}

function handleClickJoinMeetingRoom():void {
  joinMeetingDialog.value = false
}

</script>

<style lang="scss" scoped>
.wrapper {
  &:deep(.el-divider--horizontal) {
    margin: 0;
  }
  &:deep(.el-dialog__footer) {
    padding-top: 10px;
  }
  .meeting_left_content_item {
    -webkit-app-region: no-drag;
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 14px;
    overflow: hidden;
    .meeting_left_content_item_icon {
      width: 66px;
      height: 66px;
      border-radius: 15px;
      background-color: var(--main-color);
      margin-bottom: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 37px;
      }
    }
  }
  .dialog_body {
    width: 100%;
    height: 100%;
    margin-top: 10px;
    .dialog_item {
      width: 100%;
      display: flex;
      font-size: 14px;
      margin-bottom: 15px;
      &:nth-child(3){
        margin-bottom: 5px;
      }
      &:last-child {
        margin-bottom: 10px;
      }
      .label {
        width: 80px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-right: 20px;
        &.necessary::before {
          content: '*';
          color: red;
          font-size: 10px;
          margin-top: -6px;
          margin-right: 5px;
        }
      }
      .content {
        flex: 1;
      }
    }
  }
}
</style>