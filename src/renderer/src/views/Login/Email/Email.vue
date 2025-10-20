<template>
  <titleBar min close title="腾讯会议" :isPosition="false"/>
  <div class="email_wrapper">
    <BackHeader title="邮箱验证码登录" @back="handleClickBack"/>
    <div class="login_wrapper">
      <el-form :model="loginFormData">
        <el-form-item>
          <el-input v-model="loginFormData.email" clearable placeholder="请输入邮箱">
            <template #prefix>
                <el-icon class="el-input__icon">
                  <Message />
                </el-icon>
              </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="!isLogin">
          <el-input v-model="loginFormData.nickName" clearable placeholder="请输入昵称">
            <template #prefix>
                <el-icon class="el-input__icon">
                  <User />
                </el-icon>
              </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginFormData.password" type="password" clearable placeholder="请输入密码">
            <template #prefix>
                <el-icon class="el-input__icon">
                  <Unlock />
                </el-icon>
              </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="!isLogin">
          <el-input v-model="loginFormData.rePassword" type="password" clearable placeholder="请再次输入密码">
            <template #prefix>
                <el-icon class="el-input__icon">
                  <Unlock />
                </el-icon>
              </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <div class="check_code_wrapper">
            <el-input v-model="loginFormData.checkCode" clearable placeholder="请输入验证码">
              <template #prefix>
                  <el-icon class="el-input__icon">
                    <CircleCheck />
                  </el-icon>
                </template>
            </el-input>
            <img class="check_img" :src="checkCodeImg" @click="handleGetCheckCode" alt="验证码">
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary" 
            style="width: 100%; margin-top: 20px;" 
            @click="handleClickSubmitBtn"
            size="large"
            :disabled="isLogin ? loginDisabled : registerDisabled" 
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
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Unlock, CircleCheck, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { setLocalStorage, getLocalStorage } from '@/utils/localStorage'
import { fetchCheckCodeImg, register, login, type LoginFormData } from '@/service/service'
import { md5 } from 'js-md5'
import titleBar from "@/components/titleBar/titleBar.vue"
import BackHeader from '@/components/BackHeader/BackHeader.vue'
import { useUserInfoStore } from '@/store/userInfo'

const router = useRouter()
const userInfoStore = useUserInfoStore()
const loginFormData = reactive<LoginFormData>({
  email: "",
  nickName: "",
  password: "",
  rePassword: "",
  checkCode: "",
  checkCodeKey: ""
})
const isLogin = ref<boolean>(true)
const checkCodeImg = ref<string>("")

onMounted(() => {
  handleGetCheckCode()
})

const registerDisabled = computed<boolean>(() => {
  if (loginFormData.email && loginFormData.password && loginFormData.rePassword && loginFormData.checkCode) return false
  return true
})

const loginDisabled = computed<boolean>(() => {
  if (loginFormData.email && loginFormData.password && loginFormData.checkCode) return false
  return true
})

function handleGetCheckCode(): void {
  fetchCheckCodeImg().then((res: any) => {
    if (res && res.code === 200) {
      const { checkCode, checkCodeKey } = res.data
      checkCodeImg.value = checkCode
      setLocalStorage("checkCodeKey", checkCodeKey)
    }
  })
}

function handleClickIsLogin(): void {
  isLogin.value = !isLogin.value
  clearFormData()
}

function handleClickSubmitBtn(): void {
  if (isLogin.value) {
    console.log("登陆操作 ")
    handleClickLogin()
  } else {
    console.log("注册操作 ")
    handleClickRegister()
  }
}

function handleClickRegister(): void {
  if (loginFormData.password !== loginFormData.rePassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  loginFormData.checkCodeKey = getLocalStorage("checkCodeKey")
  register(loginFormData).then((res: any) => {
    if (res && res.code === 200) {
      ElMessage.success("注册成功")
      isLogin.value = !isLogin.value
    }
  }).finally(() => {
    handleGetCheckCode()
  })
}

function handleClickLogin(): void {
  loginFormData.password = md5(loginFormData.password)
  loginFormData.checkCodeKey = getLocalStorage("checkCodeKey")
  login(loginFormData).then((res: any) => {
    if (res && res.code === 200 && res.data) {
      ElMessage.success("登录成功")
       window.electron.ipcRenderer.invoke('login-success', {
        userInfo: res.data,
        wsUrl: import.meta.env.VITE_WS_URL
      })
      userInfoStore.setUserInfo(res.data)
      router.push('/home')
    }
  })
}

function handleClickBack(): void {
  router.go(-1)
}

function clearFormData(): void {
  Object.keys(loginFormData).forEach(key => {
    loginFormData[key] = ''
  })
}

</script>

<style lang="scss" scoped>
.email_wrapper {
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
    .check_code_wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      .check_img {
        width: 100px;
        height: 40px;
        margin-left: 10px;
      }
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