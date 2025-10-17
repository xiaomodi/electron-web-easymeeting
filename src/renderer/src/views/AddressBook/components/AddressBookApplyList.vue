<template>
  <div class="AddressBookApplyList_wrapper">
    <div class="title">联系人申请</div>
    <div class="AddressBookApplyList_content">
      <div v-if="!applyList.length" class="AddressBookApplyList_empty"><el-empty description="暂无联系人申请"/></div>
      <el-scrollbar style="width: 100%" v-else>
        <div class="applyList_item" v-for="item in applyList" :key="item.id">
          <ChatHeads :userInfo="item"/>
          <div class="apply_user_name">{{ item.nickName }}</div>
          <div class="apply_result_tip" v-if="item.status !== 0">{{ item.statusName }}</div>
          <el-dropdown v-if="item.status && +item.status === 0" class="apply_result_btn" placement="bottom">
            <el-button type="success" size="small"> 接受 </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click='handleClickItem(item.applyUserId, 1)'>同意</el-dropdown-item>
                <el-dropdown-item @click='handleClickItem(item.applyUserId, 2)'>拒绝</el-dropdown-item>
                <el-dropdown-item @click='handleClickItem(item.applyUserId, 3)'>拉黑</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive } from 'vue'
import ChatHeads from '@/components/ChatHeads/ChatHeads.vue'

const applyList = ref<any[]>([
  {
    userId: "",
    nickName: "测试数据",
    id: "123",
    status: "0"
  },
  {
    userId: "",
    nickName: "测试数据",
    id: "123",
    status: "0"
  },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // },
  // {
  //   userId: "",
  //   nickName: "测试数据",
  //   id: "123",
  //   status: "0"
  // }
])

function handleClickItem(userId: string, status: number): void {
  console.log(userId, status)
}

</script>

<style lang="scss" scoped>
.AddressBookApplyList_wrapper {
  flex: 5;
  height: 100%;
  padding: 30px 0px 0px 15px;
  overflow: hidden;
  .title {
    width: 100%;
    line-height: 25px;
    margin-bottom: 10px;
  }
  .AddressBookApplyList_content {
    -webkit-app-region: no-drag;
    width: 100%;
    height: calc(100% - 35px);
    padding-right: 15px;
    box-sizing: border-box;
    .AddressBookApplyList_empty {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      &:deep(.el-empty__image) {
        width: 100px;
      }
    }
    .applyList_item {
      width: 100%;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      box-sizing: border-box;
      margin-bottom: 10px;
      .apply_user_icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 20px;
        border: 1px solid var(--background-color-light);
      }
      .apply_user_name {
        font-size: 12px;
      }
      .apply_result_tip, .apply_result_btn {
        margin-left: auto;
      }
    }
  }
}
</style>