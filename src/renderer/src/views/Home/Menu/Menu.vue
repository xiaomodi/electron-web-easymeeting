<template>
  <div class="Menu_wrapper">
    <div class="menu_top">
      <div class="menu_top_item user" @click="handleClickUserIcon">
        <Avatar :userInfo="userInfo"/>
      </div>
      <div class="menu_top_item menu"
        v-for="item in menuList"
        :class="{ 'action': action === item.name}" 
        @click="handleClickMenuItem(item)">
        <el-badge :offset="[6, 0]" :value="item.value" :max="10" class="item" >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
        </el-badge>
        {{ item.desc }}
      </div>
    </div>
    <div class="menu_bottom">
      <div class="menu_bottom_item menu">
        <el-icon><Message /></el-icon>
      </div>
      <div class="menu_bottom_item menu"
        :class="{ 'action': action === 'Setting'}" 
        @click="handleClickSetting">
        <el-icon><Setting /></el-icon>
      </div>
      <div class="menu_bottom_item menu">
        <el-icon><User /></el-icon>
      </div>
    </div>
  </div>

  <Dialog v-model="userInfoDialogVisible" title="修改用户信息" width="400" show-footer class="userInfo_dialog">
    <div class="userInfo_content">
      <div class="userInfo_item">
        <p class="title top">UID</p>
        <div class="body">{{ userInfo.userId }}</div>
      </div>
      <div class="userInfo_item">
        <p class="title userIcon">头像</p>
        <div class="body">
          <Avatar :userInfo="userInfo" width="60px"/>
          <div class="upload_btn">
            <el-upload
              :before-upload="beforeAvatarUpload"
              :show-file-list="false"
            >
              <el-button type="primary">上传头像</el-button>
            </el-upload>
          </div>
        </div>
      </div>
      <div class="userInfo_item">
        <p class="title nickName">昵称</p>
        <div class="body">
          <el-input v-model="formData.nickName" clearable placeholder="请输入昵称" style="width: 100%"/>
        </div>
      </div>
      <div class="userInfo_item">
        <p class="title sex">性别</p>
        <div class="body">
          <el-radio-group v-model="formData.sex">
            <el-radio :value="0">女</el-radio>
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">保密</el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
    <el-divider />
    <template #footer>
      <el-button type="primary" @click="handleClickSubmit">确定</el-button>
    </template>
  </Dialog>
</template>

<script lang='ts' setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { Message, Setting, User, VideoCamera, Memo, VideoPlay } from '@element-plus/icons-vue'
import { useRouter, useRoute, type RouteRecordRaw } from 'vue-router'
import Bus from '@/utils/eventBus'
import { loadContactApplyDealWithCount } from '@/service/service'
import { Avatar, Dialog } from '@/components'
import { useUserInfoStore, type UserInfo } from '@/store/userInfo'
import { getLocalStorage } from '@/utils/localStorage'
import { ElMessage } from 'element-plus'
import { updateUserInfo, getAvatar, type UpdateUserInfo, GetAvatar } from '@/service/service'

interface MenuList {
  name: string,
  desc: string,
  path: string,
  icon: any,
  value: number | string
}
const router = useRouter()
const route = useRoute()
const userInfoStore = useUserInfoStore()
const action = ref<string>("Meeting")
const userInfoDialogVisible = ref<boolean>(false)
const formData = reactive<UpdateUserInfo>({
  userId: userInfoStore.userInfo.userId,
  avatar: "",
  nickName: userInfoStore.userInfo.nickName,
  sex: userInfoStore.userInfo.sex
})
const menuList = reactive<MenuList[]>([
  {
    name: "Meeting",
    desc: "会议",
    path: "/meeting",
    icon: VideoCamera,
    value: ""
  },
  {
    name: "AddressBook",
    desc: "通讯录",
    path: "/address_book",
    icon: Memo,
    value: ""
  },
  {
    name: "Record",
    desc: "录制",
    path: "/record",
    icon: VideoPlay,
    value: ""
  }
])

onMounted(() => {
  getRoute()
  getUserAvatar()
  getContactApplyDealWithCount()
})

onUnmounted(() => {
  Bus.off("reloadContactsListAndCount")
  window.electron.ipcRenderer.removeAllListeners("ws-friend-apply")
})

Bus.on("reloadContactsListAndCount", () => {
  getContactApplyDealWithCount()
})

const userInfo = computed<UserInfo>(() => userInfoStore.userInfo)

function getContactApplyDealWithCount() {
  loadContactApplyDealWithCount().then((res: any) => {
    if (res && res.code === 200) {
      menuList[1].value = res.data > 0 ? res.data : ""
    }
  })
}

function getRoute() {
  const actionRoute = route.name
  action.value = String(actionRoute ?? "")
}

function getUserAvatar() {
  userInfoStore.userInfo.userIcon = userInfoStore.userInfo.userIcon ? 
  userInfoStore.userInfo.userIcon : 
  `${import.meta.env.VITE_BASE_URL}/file/getAvatar?userId=${getLocalStorage("userInfo").userId}&token=${getLocalStorage("userInfo").token}`
}

function handleClickMenuItem(item: any) {
  action.value = String(item.name ?? "")
  router.push(item.path)
}

function handleClickSetting(): void {
  action.value = 'Setting'
  router.push("/setting")
}

function handleClickUserIcon(): void {
  userInfoDialogVisible.value = true
}

function beforeAvatarUpload(file): void {
  const imgType = ["image/png", "image/jpeg", "image/jpg"]
  const isImgType = imgType.includes(file.type);
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImgType) {
    ElMessage.error('上传头像图片只能是 JPG 格式!');
    return
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
    return
  }
  formData.avatar = file
  try{
    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      userInfoStore.setUserIcon(url)
    }
    reader.readAsDataURL(file)
  } catch(error) {
    console.log("上传图片失败！！！", error)
  }
}

function handleClickSubmit() {
  updateUserInfo(formData).then((res: any) => {
    if (res && res.code === 200) {
      ElMessage.success("用户信息修改成功！")
      userInfoDialogVisible.value = false
    } else {
      ElMessage.error("用户信息修改失败！")
    }
  })
}

</script>

<style lang="scss" scoped>
.Menu_wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--menu-background-color);
  .menu_top {
    flex: 6;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 40px;
    :deep(.el-badge__content.is-fixed){
      top: 3px;
      right: 8px;
    }
    .menu_top_item {
      width: 40px;
      margin-bottom: 10px;
      -webkit-app-region: no-drag;
      &.user {
        height: 40px;
        border-radius: 100%;
        overflow: hidden;
        margin-bottom: 15px;
      }
      &.menu {
        height: 45px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        font-size: 10px;
        :deep(.el-icon) {
          font-size: 18px;
        }
      }
      &.action {
        color: var(--main-color);
      }
      .user_icon {
        width: 100%;
        height: 100%;
         -webkit-user-drag: none
      }
    }
  }
  .menu_bottom {
    flex: 4;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding-bottom: 15px;
    .menu_bottom_item {
      width: 35px;
      height: 35px;
      -webkit-app-region: no-drag;
      margin-bottom: 3px;
      &.action {
        color: var(--main-color);
      }
      &:hover {
        background: var(--background-color-light-hover);
        border-radius: 5px;
        color: var(--ev-c-black-soft);
      }
      &.menu {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 10px;
        :deep(.el-icon) {
          font-size: 18px;
        }
      }
    }
  }
}
.userInfo_dialog {
  &:deep(.el-divider--horizontal) {
    margin: 0;
  }
}
.userInfo_content {
  width: 100%;
  padding: 10px 35px;
  box-sizing: border-box;
  .userInfo_item {
    width: 100%;
    min-height: 35px;
    font-size: 13px;
    display: flex;
    align-items: center;
    font-weight: 500;
    margin-bottom: 15px;
    &:last-child {
      margin-bottom: 3px;
    }
    .title {
      margin-right: 18px;
      letter-spacing: 1px;
      &.userIcon {
        height: 60px;
        padding-top: 6px;
      }
      &.nickName:before {
        content: "*";
        color: red;
        margin-right: 3px;
        font-size: 8px;
        vertical-align: top; /* 靠顶部对齐 */
        display: inline-block;
      }
      &.sex:before {
        content: "*";
        color: red;
        margin-right: 3px;
        font-size: 8px;
        vertical-align: top; /* 靠顶部对齐 */
        display: inline-block;
      }
    }
    .body {
      flex: 1;
      display: flex;
      .upload_btn {
        margin-left: 15px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        &:deep(.el-upload-list) {
          margin: 0;
        }
      }
    }
  }
}
</style>