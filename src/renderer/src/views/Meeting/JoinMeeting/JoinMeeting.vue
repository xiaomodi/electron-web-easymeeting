<template>
  <div class="wrapper">
    <div class="meeting_left_content_item" @mouseover="handleOnmouseOver" @mouseleave="handleOnmouseLeave" @click="handleClickJoinMeeting">
      <div class="meeting_left_content_item_icon">
        <img v-show="addAction" src="../iconfont/jiaruhuiyi1.png" alt="">
        <img v-show="!addAction" src="../iconfont/tengxunhuiyi.png" alt="">
      </div>
      加入会议
    </div>
    <Dialog v-model="joinMeetingDialog" :close="handleClearFormData" title="加入会议" width="450" showFooter>
      <div class="dialog_body">
        <div class="dialog_item">
          <div class="label necessary">会议号</div>
          <div class="content">
            <el-input v-model.trim="formData.meetingNo" placeholder="请输入会议号" clearable/>
          </div>
        </div>
        <div class="dialog_item">
          <div class="label necessary">您的名称</div>
          <div class="content">
            <el-input v-model="formData.nickName" placeholder="请输入会议号" clearable/>
          </div>
        </div>
        <div class="dialog_item">
          <div class="label">会议密码</div>
          <div class="content">
            <el-radio-group v-model="formData.joinType">
              <el-radio value="0">免密入会</el-radio>
              <el-radio value="1">密码入会</el-radio>
            </el-radio-group>
          </div>
        </div>
         <div class="dialog_item" v-show="formData.joinType == '1'">
          <div class="label"></div>
          <div class="content">
            <el-input v-model="formData.joinPassword" placeholder="请输入会议密码" clearable/>
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
import { ref, reactive, computed, watchEffect } from 'vue'
import { Dialog } from '@/components'
import { preJoinMeeting, type JoinMeetingFormData } from '@/service/service'
import { openMeetingWindow } from '../openMeetingWindow'
import { getLocalStorage } from '@/utils/localStorage'

const addAction = ref<boolean>(false)
const joinMeetingDialog = ref<boolean>(false)
const formData = reactive<JoinMeetingFormData>({
  meetingNo: "",
  nickName: "",
  joinType: "0",
  joinPassword: "",
})

watchEffect(() => {
  if (joinMeetingDialog.value) {
    initUserName()
  }
})

const disabled = computed<boolean>(() => {
  if(!formData.meetingNo.length || !formData.nickName.length) return true
  return false
})

function initUserName(): void {
  formData.nickName = getLocalStorage("userInfo").nickName ?? ""
}

function handleOnmouseOver(): void {
  addAction.value = true;
}

function handleOnmouseLeave():void {
  addAction.value = false;
}

function handleClickJoinMeeting(): void {
  joinMeetingDialog.value = true
}

function handleClickJoinMeetingRoom():void {
  preJoinMeeting(formData).then((res: any) => {
    if(res && res.code === 200) {
      joinMeetingDialog.value = false
      openMeetingWindow()
    }
  })
}

function handleClearFormData(): void {
  Object.keys(formData).forEach(key => {
    if (key === 'joinMeetingType') {
      formData[key] = "0"
    } else {
      formData[key] = ""
    }
  })
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