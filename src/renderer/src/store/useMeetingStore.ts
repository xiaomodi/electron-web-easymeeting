import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface NewUser {
  joinTime: number,
  memberType: number,
  nickName: string,
  openVideo: boolean,
  status: number,
  userId: string
}


export const useMeetingStore = defineStore('meeting', () => {
  const mumberList = ref<NewUser[]>([])
  const allMemberList = ref< NewUser[]>([])

  const setMemberList = (list: NewUser[]): void => {
    mumberList.value = list
  }

  const setAllMemberList = (list: NewUser[]): void => {
    allMemberList.value = list
  }

  return {
    mumberList,
    allMemberList,
    setMemberList,
    setAllMemberList
  }
})