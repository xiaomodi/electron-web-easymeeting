<template>
  <div class="wrapper">
    <div
      class="meeting_left_content_item" 
      @mouseover="handleOnmouseOver()" 
      @mouseleave="handleOnmouseLeave()" 
      @click="handleClickQuickMeeting">
      <div class="meeting_left_content_item_icon">
        <img v-show="quickAction" src="../iconfont/kuaisuhuiyi1.png" style="width: 30px;" alt="">
        <img v-show="!quickAction" src="../iconfont/jiaruhuiyi1.png" alt="">
      </div>
      快速会议
    </div>
   <Dialog v-model="quickMeetingDialog" :close="handleClearFormData" :confirmBtnDisable="quickMeetForm.meetingName.length == 0" title="快速会议" width="400" showFooter @confirm="handleClickConfirm" @cancel="handleClearFormData">
      <div class="quick_meeting_content">
        <div class="meeting_content_item">
          <p class="title top">会议号</p>
          <div class="body">
            <el-radio-group v-model="quickMeetForm.meetingNoType">
              <el-radio value="0" size="default">使用个人会议号</el-radio>
              <el-radio value="1" size="default">系统生成</el-radio>
            </el-radio-group>
            <el-input v-if="quickMeetForm.meetingNoType === '0'" v-model.trim="quickMeetForm.meetingNo" size="small" disabled clearable /> 
          </div>
        </div>
        <div class="meeting_content_item">
          <p class="title necessary top">会议主题</p>
          <div class="body">
            <el-input v-model="quickMeetForm.meetingName" type="textarea" size="small" clearable class="textarea" maxlength="100" show-word-limit/> 
          </div>
        </div>
         <div class="meeting_content_item">
          <p class="title top">入会密码</p>
          <div class="body">
            <el-radio-group v-model="quickMeetForm.joinType">
              <el-radio value="0" size="default">无需密码</el-radio>
              <el-radio value="1" size="default">密码入会</el-radio>
            </el-radio-group>
            <el-input v-if="quickMeetForm.joinType === '1'" v-model="quickMeetForm.joinPossword" size="small" clearable /> 
          </div>
        </div>
      </div>
      <el-divider />
   </Dialog>
  </div>
  
</template>

<script lang='ts' setup>
import { ref, reactive, watchEffect } from 'vue'
import { openMeetingWindow } from '../openMeetingWindow'
import { getLocalStorage } from '@/utils/localStorage'
import { quickMeeting } from '@/service/service'
import Dialog from '@/components/Dialog/Dialog.vue'

interface QuickMeetingForm {
  meetingNoType: string,
  meetingNo: string,
  meetingName: string,
  joinType: string,
  joinPossword?: string
}
const quickMeetForm = reactive<QuickMeetingForm>({
  meetingNoType: "0",
  meetingNo: "",
  meetingName: "",
  joinType: "0",
  joinPossword: ""
})
const quickAction = ref<boolean>(false);
const quickMeetingDialog = ref<boolean>(false);

watchEffect(() => {
  if (quickMeetingDialog.value && quickMeetForm.meetingNoType === '0') {
    quickMeetForm.meetingNo = getLocalStorage("userInfo").meetingNo
  }
})

function handleOnmouseOver(): void {
  quickAction.value = true
}

function handleOnmouseLeave(): void {
 quickAction.value = false
}

function handleClickQuickMeeting(): void {
  quickMeetingDialog.value = true
}

function handleClickConfirm(): void {
  quickMeeting(quickMeetForm).then((res: any) => {
    if (res && res.code === 200) {
      openMeetingWindow("0")
      quickMeetingDialog.value = false
      handleClearFormData()
    }
  })
}

function handleClearFormData(): void {
  Object.keys(quickMeetForm).forEach(key => {
    if (key === 'meetingNoType' || key === 'joinType') {
      quickMeetForm[key] = "0"
    } else {
      quickMeetForm[key] = ""
    }
  })
}

</script>

<style lang='scss' scoped>
.wrapper {
  &:deep(.el-divider--horizontal) {
    margin: 0;
  }
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
.quick_meeting_content {
  width: 100%;
  padding: 12px 10px;
  box-sizing: border-box;
  .meeting_content_item {
    width: 100%;
    display: flex;
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
    .title {
      width: 75px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      font-size: 14px;
      &.necessary::before {
        content: "*";
        color: red;
        margin-right: 3px;
        font-size: 8px;
      }
      &.top {
        align-items: flex-start;
        padding-top: 6px;
      }
    }
    .body {
      flex: 1;
      height: 100%;
      margin-left: 20px;
      .textarea {
        height: 60px;
        &:deep(.el-textarea__inner) {
          height: 100%;
        }
      }
    }
  }
}
</style>