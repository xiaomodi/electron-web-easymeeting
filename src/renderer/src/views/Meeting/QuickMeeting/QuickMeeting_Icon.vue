<template>
  <div class="wrapper">
    <div
      class="meeting_left_content_item" 
      @mouseover="handleOnmouseOver('quick')" 
      @mouseleave="handleOnmouseLeave('quick')" 
      @click="handleClickQuickMeeting">
      <div class="meeting_left_content_item_icon">
        <img v-show="quickAction" src="../iconfont/kuaisuhuiyi1.png" style="width: 30px;" alt="">
        <img v-show="!quickAction" src="../iconfont/jiaruhuiyi1.png" alt="">
      </div>
      快速会议
    </div>
   <Dialog v-model="quickMeetingDialog" :confirmBtnDisable="quickMeetForm.meetingSubject.length == 0" title="快速会议" width="400" showFooter @confirm="handleClickConfirm" @cancel="handleClickCancel">
      <div class="quick_meeting_content">
        <div class="meeting_content_item">
          <p class="title top">会议号</p>
          <div class="body">
            <el-radio-group v-model="quickMeetForm.createMeetNumber">
              <el-radio value="0" size="default">使用个人会议号</el-radio>
              <el-radio value="1" size="default">系统生成</el-radio>
            </el-radio-group>
            <el-input v-if="quickMeetForm.createMeetNumber === '0'" v-model="quickMeetForm.meetingNumber" size="small" disabled clearable /> 
          </div>
        </div>
        <div class="meeting_content_item">
          <p class="title necessary top">会议主题</p>
          <div class="body">
            <el-input v-model="quickMeetForm.meetingSubject" type="textarea" size="small" clearable class="textarea" maxlength="100" show-word-limit/> 
          </div>
        </div>
         <div class="meeting_content_item">
          <p class="title top">入会密码</p>
          <div class="body">
            <el-radio-group v-model="quickMeetForm.isPossword">
              <el-radio value="0" size="default">无需密码</el-radio>
              <el-radio value="1" size="default">密码入会</el-radio>
            </el-radio-group>
            <el-input v-if="quickMeetForm.isPossword === '1'" v-model="quickMeetForm.meetingPossword" size="small" clearable /> 
          </div>
        </div>
      </div>
      <el-divider />
   </Dialog>
  </div>
  
</template>

<script lang='ts' setup>
import { ref, reactive, watch } from 'vue'
import { useUserInfoStore } from '@/store/userInfo'
import Dialog from '@/components/Dialog/Dialog.vue'

const userInfoStore = useUserInfoStore()

interface QuickMeetingForm {
  createMeetNumber: string,
  meetingNumber: string,
  meetingSubject: string,
  isPossword: string,
  meetingPossword?: string
}
const quickMeetForm = reactive<QuickMeetingForm>({
  createMeetNumber: "0",
  meetingNumber: "",
  meetingSubject: "",
  isPossword: "0",
  meetingPossword: ""
})
const quickAction = ref<boolean>(false);
const quickMeetingDialog = ref<boolean>(false);

watch(() => quickMeetForm.createMeetNumber, (newVal) => {
  if (+newVal === 0) {
    quickMeetForm.meetingNumber = userInfoStore.userInfo.meetingNo
  } else {
    // TODO使用系统生成的
  }
}, {
  immediate: true,
  deep: true
})


function handleOnmouseOver(item: string): void {
  quickAction.value = true
}

function handleOnmouseLeave(item: string): void {
 quickAction.value = false
}

function handleClickQuickMeeting(): void {
  quickMeetingDialog.value = true
}

function handleClickConfirm(addType: string = "0", screenId: string = ""): void {
  window.electron.ipcRenderer.invoke("open-quick-meeting-window", {
    title: "快速会议",
    windowId: 'meeting',
    path: "/quickmeeting",
    data: {
      addType, // 0 不共享屏幕 1 共享屏幕
      screenId // 屏幕共享id
    },
    width: 1310,
    height: 800,
    maximizable: true
  })
  quickMeetingDialog.value = false
}

function handleClickCancel(): void {
  quickMeetForm.createMeetNumber = "0"
  quickMeetForm.meetingNumber = ""
  quickMeetForm.meetingSubject = ""
  quickMeetForm.isPossword = "0"
  quickMeetForm.meetingPossword = ""
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