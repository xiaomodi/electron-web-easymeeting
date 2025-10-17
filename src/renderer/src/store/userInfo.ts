import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { setLocalStorage } from '@/utils/localStorage'

export interface UserInfo {
  admin: boolean,
  meetingNo: string,
  nickName: string,
  sex: number | string | null,
  token: string,
  userId: string,
}


export const useUserInfoStore = defineStore("userInfo", () => {
  let userInfo = reactive<UserInfo>({
    admin: false,
    meetingNo: '31321313123',
    nickName: "test",
    sex: null,
    token: "jaidlajdlskajdkaljdasldaskd",
    userId: "",
  })

  function getUserInfo(): UserInfo {
    return userInfo
  }

  function setUserInfo<T extends UserInfo>(info: T): void {
    userInfo = Object.assign(userInfo, info)
    setLocalStorage('userInfo', userInfo)
  }

  return {
    userInfo,
    getUserInfo,
    setUserInfo
  }
})