import { service } from '../index'
import { type LoginFormData } from './type'
export * from './type'
// 获取验证码
export const fetchCheckCodeImg = () => {
  return service({
    url: "/account/checkCode",
    method: "GET",
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
    method: 'POST',
    params
  })
}

export const initProject = () => {
  return service({
    url: "/init",
    method: 'GET'
  })
}