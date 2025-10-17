<template>
  <titleBar close min title="腾讯会议" :isPosition="false"/>
  <div class="wrapper">
    <div class="login_top">
      <div class="login_logo">
        <img alt="logo" class="login_logo_img" src="./image/txhy.svg" />
      </div>
      <el-button type="primary" class="wx_login_btn">微信登陆</el-button>
      <div class="divider_wrapper">
        <el-divider>其他方式登陆</el-divider>
      </div>
    </div>
    <div class="login_body">
      <div class="login_body_item" @click="handleClickItem('phone')">
        <div class="login_body_item_top">
          <img src="./image/shoujihao.png" alt="">
        </div>
        手机号
      </div>
      <div class="login_body_item" @click="handleClickItem('email')">
        <div class="login_body_item_top">
          <img src="./image/youxiang.png" alt="">
        </div>
        邮箱
      </div>
      <div class="login_body_item" @click="handleClickItem('SSO')">
        <div class="login_body_item_top">
          <img src="./image/sso2.png" alt="">
        </div>
        SSO
      </div>
      <div class="login_body_item">
        <div class="login_body_item_top">
          <img src="./image/qiyeweixin.png" alt="">
        </div>
        企业微信
      </div>
    </div>
    <div class="login_footer">
      <el-checkbox v-model="isCheck" class="Login_footer_checkbox"/>
      我已阅读并同意<el-link type="primary" :underline="false">《服务协议》</el-link>和<el-link type="primary" :underline="false">《隐私政策》</el-link>
    </div>
  </div>


   <el-dialog
    v-model="dialogVisible"
    title="服务协议与隐私条款"
    width="350"
    :before-close="handleClickDisagree"
  >
    <span>This is a message</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClickDisagree">不同意</el-button>
        <el-button type="primary" @click="handleClickAgree">
          同意
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang='ts' setup>
import { ref, reactive, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import titleBar from '@/components/titleBar/titleBar.vue'
import { setLocalStorage, getLocalStorage } from '@/utils/localStorage'
import { initProject } from '@/service/service'

const router = useRouter()

const isCheck = ref<boolean>(false);
const dialogVisible = ref<boolean>(false);
const clickType = ref<string>('')

onMounted(() => {
  initProject()
})

watchEffect(() => {
  const isChecked = getLocalStorage("isCheck")
  isCheck.value = isChecked ? isChecked : false
})

function handleClickAgree() {
  isCheck.value = true
  dialogVisible.value = false
  setChecked()
  setTimeout(() => {
    router.push(`/${clickType.value}`)
  }, 100);
}

function handleClickDisagree() {
  dialogVisible.value = false
}

function handleClickItem(type: string) {
  clickType.value = type
  if (!judgeIsCheck()) return
  router.push(`/${type}`)
}

function judgeIsCheck(): boolean {
  if (isCheck.value) return true
  dialogVisible.value = true
  return false
}

function setChecked() {
  setLocalStorage("isCheck", isCheck.value)
}




</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100vh;
  background: #fff;
  color: #000;
  .login_top {
    width: 100%;
    height: 430px;
    margin-bottom: 30px;
    padding: 20px;
    box-sizing: border-box;
    .login_logo {
      width: 100%;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      .login_logo_img {
        width: 240px;
      }
    }
    .wx_login_btn {
      width: 100%;
      height: 40px;
      margin-top: 10px;
      margin-bottom: 25px;
    }
    .divider_wrapper {
      padding: 0 25px;
      font-weight: 400;
      :deep(.el-divider__text){
        color: #909399;
      }
    }
  }
  .login_body {
    width: 100%;
    height: 100px;
    padding: 5px 25px;
    display: flex;
    justify-content: space-around;
    box-sizing: border-box;
    .login_body_item {
      width: 50px;
      height: 80px;
      font-size: 12px;
      text-align: center;
      box-sizing: border-box;
      .login_body_item_top {
        width: 45px;
        height: 45px;
        background-color: #f0f2f5;
        border-radius: 5px;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          background: #e4e7ed;
        }
        img {
          width: 25px;
        }
      }
    }
  }
  .login_footer {
    width: 100%;
    height: 30px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    .Login_footer_checkbox {
      margin-right: 5px;
    }
  }
}
</style>