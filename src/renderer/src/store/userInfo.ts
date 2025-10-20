import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { setLocalStorage } from '@/utils/localStorage'

export interface UserInfo {
  userId: string,
  nickName: string,
  sex: number | string | null,
  token: string,
  meetingNo: string,
  admin: boolean
}

export const useUserInfoStore = defineStore("userInfo", () => {
  let userInfo = reactive<UserInfo>({
    "userId": "",
    "nickName": "",
    "sex": null,
    "token": "",
    "meetingNo": "",
    "admin": false
  })

  function getUserInfo(): UserInfo {
    return userInfo
  }

  function setUserInfo<T extends UserInfo>(info: T): void {
    userInfo = Object.assign(userInfo, info)
    setLocalStorage('token', userInfo.token)
    setLocalStorage('userInfo', userInfo)
  }

  return {
    userInfo,
    getUserInfo,
    setUserInfo
  }
})