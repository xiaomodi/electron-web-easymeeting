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
          <ChatHeads :userInfo="item"/>
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
    draggable
  >
    <div class="dialog_content">
      <el-input v-model="searchValue" class="dialog_input" placeholder="输入联系人ID搜索" :prefix-icon="Search" clearable />
      <el-button type="primary" size="small" @click="handleClickSearch">搜索</el-button>
    </div>
    <div v-if="!searchList.length" class="dialog_content_empty">
      <el-empty description="暂无联系人"/>
    </div>
    <div v-else class="searchList_content">
      <div class="search_item" v-for="item in searchList" :key="item.id">
        <ChatHeads :userInfo="item"/>
        <div class="user_name">{{ item.nickName }}</div>
        <div class="search_user_state">
          <span v-if="item.state && +item.state === -1">自己</span>
          <span v-else-if="item.state && +item.state === 1" style="color: var(--success-color)">已是联系人</span>
          <span v-else-if="item.state && +item.state === 3" style="color: var(--error-color)">你被对方拉黑</span>
          <span v-else-if="item.state && +item.state === 0" style="color: var(--wait-color)">已申请待处理</span>
          <span v-else>
            <el-button type="primary" size="small" @click="handleClickApply">申请好友</el-button>
          </span>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script lang='ts' setup>
import { ref, reactive } from 'vue'
import { Search, User, More } from '@element-plus/icons-vue'
import Dialog from '@/components/Dialog/Dialog.vue'
import ChatHeads from '@/components/ChatHeads/ChatHeads.vue'

const dialogVisible = ref<boolean>(false)
const searchContacts = ref<string>("")
const searchValue = ref<string>("")
const contactsList = ref([
  {
    nickName: "测试数据",
    id: "123",
    state: ""
  },
  {
    nickName: "试数据",
    id: "1234",
    state: ""
  },
  // {
  //   nickName: "测试数据",
  //   id: "123",
  //   state: ""
  // },
  // {
  //   nickName: "试数据",
  //   id: "1234",
  //   state: ""
  // },
  // {
  //   nickName: "测试数据",
  //   id: "123",
  //   state: ""
  // },
  // {
  //   nickName: "试数据",
  //   id: "1234",
  //   state: ""
  // },
  // {
  //   nickName: "测试数据",
  //   id: "123",
  //   state: ""
  // },
  // {
  //   nickName: "试数据",
  //   id: "1234",
  //   state: ""
  // },
  // {
  //   nickName: "测试数据",
  //   id: "123",
  //   state: ""
  // },
  // {
  //   nickName: "试数据",
  //   id: "1234",
  //   state: ""
  // },
  // {
  //   nickName: "测试数据",
  //   id: "123",
  //   state: ""
  // },
  // {
  //   nickName: "试数据",
  //   id: "1234",
  //   state: ""
  // },
  // {
  //   nickName: "测试数据",
  //   id: "123",
  //   state: ""
  // },
  // {
  //   nickName: "试数据",
  //   id: "1234",
  //   state: ""
  // },
  // {
  //   nickName: "测试数据",
  //   id: "123",
  //   state: ""
  // },
  // {
  //   nickName: "试数据",
  //   id: "1234",
  //   state: ""
  // },
])

const searchList = ref([{
  userId: "",
  nickName: "测试数据",
  id: "123",
  state: ""
}])

function handleClickAdd(): void {
  dialogVisible.value = true
}

function handleClickSearch(): void {
  console.log("handleClickSearch")
}

function handleClickApply(): void {
  console.log("handleClickApply")
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
    }
    .search_user_state {
      margin-left: auto;
    }
  }
}
</style>