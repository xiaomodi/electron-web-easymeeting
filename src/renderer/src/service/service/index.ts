import { service } from '../index'
import { type LoginFormData, SearchContact, SearchContactData, ContactApply, ApplyList, DealWithApplyParams, ContactsListData, JoinMeetingFormData, UpdateUserInfo, GetAvatar } from './type'
export * from './type'
// 获取验证码
export const fetchCheckCodeImg = () => {
  return service({
    url: "/account/checkCode",
    method: "GET"
  })
}

// 注册
export const register = (params: LoginFormData) => {
  return service({
    url: "/account/register",
    method: "POST",
    params
  })
}

// 登录
export const login = (params: LoginFormData) => {
  return service({
    url: "/account/login",
    method: 'GET',
    params
  })
}

export const searchContact = (params: SearchContact): Promise<SearchContactData> => {
  return service({
    url: "/userContact/searchContact",
    method: "GET",
    params
  })
}

// 申请添加好友
export const contactApply = (params: ContactApply) => {
  return service({
    url: "/userContact/contactApply",
    method: "GET",
    params
  })
}

// "/userContact/loadContactuser
export const loadContactuser = (): Promise<ContactsListData[]> => {
  return service({
    url: "/userContact/loadContactUser",
    method: "GET"
  })
}

// 申请联系人列表
// "/usercontact/1oadcontactApply"
export const loadcontactApply = (): Promise<ApplyList[]> => {
  return service({
    url: "/userContact/loadContactApply",
    method: "GET"
  })
}

export const dealWithApply = (params: DealWithApplyParams) => {
  return service({
    url: "/userContact/dealWithApply",
    method: "GET",
    params
  })
}

// "/userContact/1oadContactApplyDealwithCount"

export const loadContactApplyDealWithCount = () => {
  return service({
    url: "/userContact/loadContactApplyDealWithCount",
    method: "GET"
  })
}

// 共享屏幕加入会议
export const reserveJoinMeeting = (params: JoinMeetingFormData) => {
  return service({
    url: "/meeting/reserveJoinMeeting",
    method: "GET",
    params
  })
}

// 加入会议
export const preJoinMeeting = (params: JoinMeetingFormData) => {
  return service({
    url: "/meeting/preJoinMeeting",
    method: "GET",
    params
  })
}

export const quickMeeting = (params) => {
  return service({
    url: "/meeting/quickMeeting",
    method: "GET",
    params
  })
}

// 加入会议
interface JoinMeeting {
  videoOpen: boolean,
  
}
export const joinMeeting = (params: JoinMeeting) => {
  return service({
    url: "/meeting/joinMeeting",
    method: "GET",
    params
  })
}

// 发起开启或者关闭摄像头的消息
interface SendOpenVideoChangeMessage {
  openVideo: boolean
}
export const sendOpenVideoChangeMessage = (params: SendOpenVideoChangeMessage) => {
  return service({
    url: "/meeting/sendOpenVideoChangeMessage",
    method: "GET",
    params
  })
}

export const exitMeeting = () => {
  return service({
    url: "/meeting/exitMeeting",
    method: "GET"
  })
}

export const updateUserInfo = (params: UpdateUserInfo) => {
  return service({
    url: "/account/updateUserInfo",
    method: "GET",
    params
  })
}

// "/api/file/getAvatar"
export const getAvatar = (params: GetAvatar) => {
  return service({
    url: "/file/getAvatar",
    method: "GET",
    params
  })
}