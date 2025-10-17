import { service } from '../index'

interface LoginFormData {
  email: string,
  username?: string,
  password: string,
  passwordAgain?: string,
  identifyCode: string
}

// 获取验证码
export const getCheckCode = () => {
  return service({
    url: "",
    method: "POST"
  })
}
export const login = (params: LoginFormData) => {
  return service({
    url: '/login',
    method: 'POST',
    data: params
  })
}

export const initProject = () => {
  return service({
    url: "/init",
    method: 'GET'
  })
}