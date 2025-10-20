<template>
  <div class="wrapper">
    <div class="meeting_left_content_item" @mouseover="handleOnmouseOver()"  @mouseleave="handleOnmouseLeave()" @click="handleClickShareScreen">
      <div class="meeting_left_content_item_icon">
        <img v-show="shareAction" src="../iconfont/gongxiangpingmu.png" alt="">
        <img v-show="!shareAction" src="../iconfont/gongxiangpingmu1.png" style="width: 33px;" alt="">
      </div>
      共享屏幕
    </div>
    <Dialog v-model="ShareScreenMeetingDialog" :close="handleClearFormData" title="共享屏幕" width="450" showFooter draggable>
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
            <el-input v-model="formData.nickName" placeholder="请输入您的昵称" clearable/>
          </div>
        </div>
        <div class="dialog_item select_screen">
          <div class="label screen_label necessary">选择屏幕</div>
          <div class="content select_screen_content">
            <el-radio-group v-model="formData.selectScreen">
              <el-radio v-for="item in screenList" :key="item.display_id" :value="item.display_id">
                <div class="select_screen_wrapper">
                  <img :src="item.thumbnail" alt="" />
                  <p>{{ item.name }}</p>
                </div>
              </el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="dialog_item">
          <div class="label">会议密码</div>
          <div class="content">
            <el-radio-group v-model="formData.joinMeetingType">
              <el-radio value="0">免密入会</el-radio>
              <el-radio value="1">密码入会</el-radio>
            </el-radio-group>
          </div>
        </div>
         <div class="dialog_item" v-show="formData.joinMeetingType == '1'">
          <div class="label"></div>
          <div class="content">
            <el-input v-model="formData.meetingPassword" placeholder="请输入会议密码" clearable/>
          </div>
        </div>
      </div>
      <el-divider />
      <template #footer>
        <el-button type="primary" :disabled="disabled" @click="handleClickShareScreenBtn">共享屏幕</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Dialog } from '@/components'
import { useUserInfoStore } from '@/store/userInfo'

interface FormData {
  meetingId: string,
  nickName: string,
  selectScreen: string,
  joinMeetingType: "0" | "1",
  meetingPassword?: string,
}

interface MapList {
  id: string,
  name: string,
  thumbnail: string,
  display_id: string
}

const userInfoStore = useUserInfoStore()
const shareAction = ref<boolean>(false)
const ShareScreenMeetingDialog = ref<boolean>(false)
const formData = reactive<FormData>({
  meetingId: "",
  nickName: "",
  selectScreen: "",
  joinMeetingType: "0",
  meetingPassword: "",
})
const screenList = ref<MapList[]>([])

onMounted(() => {
  getScreenList()
  initUserName()
})

const disabled = computed(() => {
  return !formData.meetingId || !formData.nickName || !formData.selectScreen
})

function initUserName(): void {
  formData.nickName = userInfoStore.userInfo.nickName ?? ""
}

function getScreenList() {
  window.electron.ipcRenderer.invoke("get-screen-source", {
    types: ["screen"],
    thumnailSize: {
      width: 170,
      height: 90
    },
    fetchWindowIcons: false
  }).then(res => {
    console.log("getScreenList", res)
    if (res.length) {
      screenList.value = res
      formData.selectScreen = res[0].display_id
    }
  })
}

function handleOnmouseOver(): void {
  shareAction.value = true
}

function handleOnmouseLeave(): void {
  shareAction.value = false
}

function handleClickShareScreen(): void {
  ShareScreenMeetingDialog.value = true
}

function handleClickShareScreenBtn(): void {
  console.log("开启共享屏幕", formData)
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
      &:nth-child(4){
        margin-bottom: 5px;
      }
      &:last-child {
        margin-bottom: 10px;
      }
      &.select_screen {
        overflow: hidden;
        &:deep(.el-radio) {
          height: auto;
        }
        &:deep(.el-radio__input) {
          top: -30px;
        }
      }
      .label {
        width: 80px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-right: 20px;
        &.screen_label {
          position: relative;
          top: -30px;
        }
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
        .select_screen_wrapper {
          width: 120px;
          border: 1px solid var(--border-color-dark);
          overflow: hidden;
          img {
            width: 100%;
            height: 70px;
          }
          p {
            text-align: center;
          }
        }
        .is-checked {
          .select_screen_wrapper {
            border: 1px solid var(--main-color);
          }
        }

      }
    }
  }
}
</style>