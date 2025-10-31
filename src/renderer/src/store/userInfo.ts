import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { setLocalStorage } from '@/utils/localStorage'

export interface UserInfo {
  userId: string,
  nickName: string,
  sex: number | string,
  token: string,
  meetingNo: string,
  admin: boolean,
  userIcon: string
}

export const useUserInfoStore = defineStore("userInfo", () => {
  let userInfo = reactive<UserInfo>({
    "userId": "",
    "nickName": "",
    "sex": "",
    "token": "",
    "meetingNo": "",
    "admin": false,
    userIcon: ""
  })

  function getUserInfo(): UserInfo {
    return userInfo
  }

  function setUserInfo<T extends UserInfo>(info: T): void {
    userInfo = Object.assign(userInfo, info)
    setLocalStorage('token', userInfo.token)
    setLocalStorage('userInfo', userInfo)
  }

  function setUserIcon(icon: string) {
    userInfo.userIcon = icon
  }

  return {
    userInfo,
    getUserInfo,
    setUserInfo,
    setUserIcon
  }
})