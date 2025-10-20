<template>
  <titleBar min close title="腾讯会议" :isPosition="false"/>
  <div class="phone_wrapper">
    <BackHeader title="手机验证码登录" @back="handleClickBack"/>
    <div class="login_wrapper">
      <el-form :model="loginFormData">
        <el-form-item>
          <el-input v-model="loginFormData.email" clearable placeholder="请输入手机号">
            <template #prefix>
                <el-icon class="el-input__icon">
                  <Message />
                </el-icon>
              </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="!isLogin">
          <el-input v-model="loginFormData.username" clearable placeholder="请输入昵称">
            <template #prefix>
                <el-icon class="el-input__icon">
                  <User />
                </el-icon>
              </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginFormData.password" clearable placeholder="请输入密码">
            <template #prefix>
                <el-icon class="el-input__icon">
                  <Unlock />
                </el-icon>
              </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="!isLogin">
          <el-input v-model="loginFormData.passwordAgain" clearable placeholder="请再次输入密码">
            <template #prefix>
                <el-icon class="el-input__icon">
                  <Unlock />
                </el-icon>
              </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginFormData.identifyCode" clearable placeholder="请输入验证码">
            <template #prefix>
                <el-icon class="el-input__icon">
                  <CircleCheck />
                </el-icon>
              </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary" 
            style="width: 100%; margin-top: 20px;" 
            @click="handleClickLogin"
            v-loading.fullscreen.lock="loginLoading"
            size="large"
           :disabled="disabled" 
          >
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="text_bottom" @click="handleClickIsLogin">{{ isLogin ? '注册账号' : '已有账号？'}}</div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, reactive, computed } from 'vue'
import { Message, Unlock, CircleCheck, User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { login } from '@/service/service'
import titleBar from "@/components/titleBar/titleBar.vue"
import BackHeader from '@/components/BackHeader/BackHeader.vue'
import { useUserInfoStore } from '@/store/userInfo'

const router = useRouter()
const userInfoStore = useUserInfoStore()

interface LoginFormData {
  email: string,
  username?: string,
  password: string,
  passwordAgain?: string,
  identifyCode: string
}

const loginFormData = reactive<LoginFormData>({
  email: "",
  username: "",
  password: "",
  passwordAgain: "",
  identifyCode: ""
})
const isLogin = ref<boolean>(true)
const loginLoading = ref<boolean>(false)

const disabled = computed<boolean>(() => {
  if (loginFormData.email && loginFormData.password && loginFormData.identifyCode) return false
  return true
})

function handleClickIsLogin() {
  isLogin.value = !isLogin.value
}

function handleClickLogin() {
  loginLoading.value = true
  login(loginFormData).then(res => {

  }).catch(err => {
    setTimeout(() => {
      loginLoading.value = false
      window.electron.ipcRenderer.invoke('login-success', {
        userInfo: {
          email: "loginFormData.email",
          password: "loginFormData.password",
          username: "loginFormData.username"
        },
        wsUrl: import.meta.env.VITE_WS_URL
      })
      // userInfoStore.setUserInfo({
      //   email: "loginFormData.email",
      //   password: "loginFormData.password",
      //   username: "loginFormData.username"
      // })
      router.push('/home')
    }, 1000)
  })
}

function handleClickBack() {
  router.go(-1)
}

</script>

<style lang="scss" scoped>
.phone_wrapper {
  width: 100%;
  height: 100vh;
  padding-top: 30px;
  background: var(--ev-c-white-soft);
  color: #000;
  .login_wrapper{
    width: 100%;
    padding: 10px 20px;
    margin-top: 15px;
    box-sizing: border-box;
    :deep(.el-input__wrapper) {
      box-shadow: none;
      border-bottom: 1px solid var(--el-input-border-color);
      background: var(--ev-c-white-soft);
    }
    :deep(.is-focus) {
      border-bottom: 1px solid var(--el-input-focus-border)
    }
    .text_bottom {
      font-size: 14px;
      color: var(--el-color-primary);
      cursor: pointer;
      display: flex;
      justify-content: flex-end;
    }
  }
}

</style>