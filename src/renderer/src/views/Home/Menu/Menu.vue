<template>
  <div class="Menu_wrapper">
    <div class="menu_top">
      <el-badge
        is-dot
        offset="[-5, 0]"
      >
        <div class="menu_top_item user">
          <img class="user_icon" src="./user_icon.png" alt="" />
        </div>
      </el-badge>
      <div class="menu_top_item menu"
        v-for="item in menuList"
        :class="{ 'action': action === item.name}" 
        @click="handleClickMenuItem(item)">
        <el-badge is-dot :offset="[6, 0]" class="item">
          <el-icon>
            <component :is="item.meta?.icon" />
          </el-icon>
        </el-badge>
        {{ item.meta?.name }}
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
</template>

<script lang='ts' setup>
import { ref, reactive, computed, onMounted, type ComputedRef } from 'vue'
import { Message, Setting, User } from '@element-plus/icons-vue'
import { useRouter, useRoute, type RouteRecordRaw } from 'vue-router'
import { routerList } from '@/router'

const router = useRouter()
const route = useRoute()

const action = ref<string>("")

onMounted(() => {
  getRoute()
})

const menuList:ComputedRef<RouteRecordRaw[]> = computed(() => {
  let list: RouteRecordRaw[] = []
  routerList.forEach(item => {
    if (item.name === "Home") {
      action.value = item.children?.length ? String(item.children[0].name ?? "") : ""
      list = item.children ?? []
    }
  })
  list = list.filter(item => !["Setting"].includes(String(item.name ?? "")))
  return list
})

function getRoute() {
  const actionRoute = route.name
  action.value = String(actionRoute ?? "")
}

function handleClickMenuItem(item: RouteRecordRaw) {
  action.value = String(item.name ?? "")
  router.push(item.path)
}

function handleClickSetting(): void {
  action.value = 'Setting'
  router.push("/setting")
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
</style>