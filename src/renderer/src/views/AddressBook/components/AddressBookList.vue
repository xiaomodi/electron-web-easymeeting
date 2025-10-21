<template>
  <div class="AddressBookList_wrapper">
    <div class="title">我的联系人</div>
    <div class="input_wrapper">
      <el-input
        v-model="searchContacts"
        :prefix-icon="Search" 
        placeholder="输入联系人搜索"
        class="add_input"
        clearable
      />
      <div class="add_btn" @click="handleClickAdd">
        <el-icon><User /></el-icon>
      </div>
    </div>
    <div class="contacts_list">
      <div v-if="!contactsList.length" class="empty"> <el-empty description="暂无联系人" /></div>
      <el-scrollbar v-else>
        <div class="contacts_item" v-for="(item, index) in contactsList" :key="index">
          <Avatar :userInfo="item" width="35px"/>
          <div class="contacts_username">{{ item.nickName }}</div>
          <el-dropdown :hide-on-click="false" class="dropdown" >
            <span class="more">
              <el-icon><More /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleClickItem" style="font-size: 12px;">删除</el-dropdown-item>
                <el-dropdown-item @click="handleClickItem" style="font-size: 12px;">拉黑</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-scrollbar>
    </div>
  </div>
  <Dialog
    v-model="dialogVisible"
    title="添加联系人"
    :show-footer="false"
    :close="handleDialogCLose"
    draggable
  >
    <div class="dialog_content">
      <el-input v-model="searchValueByUserId" class="dialog_input" placeholder="输入联系人ID搜索" :prefix-icon="Search" clearable />
      <el-button type="primary" size="small" @click="handleClickSearch">搜索</el-button>
    </div>
    <div v-if="!searchList.length" class="dialog_content_empty">
      <el-empty description="暂无联系人"/>
    </div>
    <div v-else class="searchList_content">
      <div class="search_item" v-for="item in searchList" :key="item.userId">
        <Avatar :userInfo="item" width="35px"/>
        <div class="user_name">{{ item.nickName }}</div>
        <div class="search_user_state">
          <span v-if="item.status && +item.status === -1">自己</span>
          <span v-else-if="item.status && +item.status === 1" style="color: var(--success-color)">已是联系人</span>
          <span v-else-if="item.status && +item.status === 3" style="color: var(--error-color)">你被对方拉黑</span>
          <span v-else-if="item.status && +item.status === 0" style="color: var(--wait-color)">已申请待处理</span>
          <span v-else>
            <el-button type="primary" size="small" @click="handleClickApply(item)">申请好友</el-button>
          </span>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script lang='ts' setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, User, More } from '@element-plus/icons-vue'
import { searchContact, contactApply, loadContactuser, type SearchContactData, ContactsListData } from '@/service/service/index'
import Bus from '@/utils/eventBus'
import Dialog from '@/components/Dialog/Dialog.vue'
import Avatar from '@/components/Avatar/Avatar.vue'

const dialogVisible = ref<boolean>(false)
const searchContacts = ref<string>("")
const searchValueByUserId = ref<string>("")
const contactsList = reactive<ContactsListData[]>([])
const searchList = reactive<SearchContactData[]>([])

onMounted(() => {
  getContactList()
  WsFriendApplyHandle()
})

onUnmounted(() => {
  Bus.off("reloadContactsListAndCount")
})

Bus.on("reloadContactsListAndCount", () => {
  getContactList()
})

function WsFriendApplyHandle() {
  window.electron.ipcRenderer.on("ws-friend-apply-handle", (e, data) => {
    getContactList()
    const { messageContent, sendUserNickName } = data
    let text = ""
    let type = ""
    switch(+messageContent) {
      case 1:
        text = `${sendUserNickName}已经同意了你的申请`
        type = "success"
        break
      case 2:
        text = `${sendUserNickName}拒绝了你的申请`
        type = "error"
        break
      case 3:
        text = `${sendUserNickName}已经把你拉黑了`
        type = "info"
        break
    }
    ElMessageBox.confirm(
      text,
      "消息",
      {
        confirmButtonText: "确定",
        showCancelButton: false,
        type: type as 'info' | 'success' | 'warning' | 'error',
      }
    )
  })
}

function getContactList(): void {
  loadContactuser().then((res: any) => {
    if (res && res.code === 200 && res.data && res.data.length) {
      contactsList.length = 0
      contactsList.push(...res.data)
    }
  })
}

function handleClickAdd(): void {
  dialogVisible.value = true
}

function handleClickSearch(): void {
  searchList.length = 0
  searchContact({
    userId: searchValueByUserId.value
  }).then((res: any) => {
    if (res && res.code === 200 && res.data) {
      ElMessage.success("搜索成功")
      searchList.push(res.data)
    }
  })
}

function handleDialogCLose(): void {
  searchList.length = 0
  searchValueByUserId.value = ""
}

function handleClickApply(item: SearchContactData): void {
  contactApply({
    receiveUserId: item.userId
  }).then((res: any) => {
    if (res && res.code === 200) {
      if (res.data === 0) {
        ElMessage.success("申请成功，等待对方接受！")
      } else {
        ElMessage.success("添加好友成功！")
      }
      dialogVisible.value = false
      handleDialogCLose()
    }
  })
}

function handleClickItem():void {}

</script>

<style lang="scss" scoped>
.AddressBookList_wrapper {
  flex: 5;
  height: 100%;
  padding: 30px 15px 0px 15px;
  border-right: 1px solid var(--background-color-light);
  box-sizing: border-box;
  overflow: hidden;
  .title {
    width: 100%;
    line-height: 25px;
    margin-bottom: 10px;
  }
  .input_wrapper {
    -webkit-app-region: no-drag;
    width: 100%;
    height: 35px;
    display: flex;
    box-sizing: border-box;
    margin-bottom: 10px;
    .add_input {
      flex: 1;
      height: 100%;
      margin-right: 20px;
    }
    .add_btn {
      width: 35px;
      height: 35px;
      border-radius: 5px;
      background: var(--background-color-dark);
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ev-c-black-soft);
      cursor: pointer;
    }
  }
  .contacts_list {
    -webkit-app-region: no-drag;
    width: 100%;
    height: calc(100% - 45px - 35px);
    box-sizing: border-box;
    // overflow-y: scroll;
    .empty {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      &:deep(.el-empty__image) {
        width: 100px;
      }
    }
    .contacts_item {
      width: 100%;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin-bottom: 10px;
      .contacts_username {
        font-size: 12px;
        margin-left: 10px;
      }
      .dropdown {
        width: 30px;
        margin-left: auto;
        font-size: 12px!important;
        &:deep(.el-tooltip__trigger:focus-visible) {
          outline: none;
        }
        .more {
          width: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}
.dialog_content {
  width: 100%;
  height: 35px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  .dialog_input {
    margin-right: 10px;
  }
}
.dialog_content_empty {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:deep(.el-empty__image) {
    width: 70px;
  }
}
.searchList_content {
  width: 100%;
  .search_item {
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .search_icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 20px;
      border: 1px solid var(--background-color-light);
    }
    .user_name {
      font-size: 12px;
      margin-left: 10px;
    }
    .search_user_state {
      margin-left: auto;
    }
  }
}
</style>