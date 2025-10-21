import { service } from '../index'
import { type LoginFormData, SearchContact, SearchContactData, ContactApply, ApplyList, DealWithApplyParams, ContactsListData } from './type'
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