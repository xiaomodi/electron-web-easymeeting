import axios, { AxiosInstance } from 'axios'
import { ElLoading, ElMessage, type LoadingInstance  } from 'element-plus'
import { getLocalStorage } from '@/utils/localStorage'

let loading : LoadingInstance | null = null
const loadingConfig = {
  lock: true,
  text: '加载中...',
  background: 'rgba(255, 255, 255, 0.8)',
}
export const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000
})

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _requestId?: string,
    _requestStartTime?: number,
    _requestTimeout?: NodeJS.Timeout
  }
}

service.interceptors.request.use(
  config => {
    loading = ElLoading.service(loadingConfig)
    config.headers
      .set("Content-Type", "application/json")
      .set("X-Requested-With", "XMLHttpRequest")
    const token: string = getLocalStorage("token")
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`)
      config.headers.set("token", token)
    }
    const requestId: string =generateRequestId()
    config._requestId = requestId
    config._requestStartTime = Date.now()
    const timeout: number = config.timeout!
    const time: NodeJS.Timeout = setTimeout(() => {
      loading?.close()
      ElMessage.error("请求超时！")
    }, timeout)
    config._requestTimeout = time
    return config
  },
  error => {
    loading?.close()
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    // console.log("response", response)
    if (response.config && response.config._requestTimeout) {
      clearTimeout(response.config._requestTimeout)
    }
    loading?.close()
    if (response.status === 200 && response.data && response.data.code === 200) {
      return response.data
    }
    return ElMessage.error(response.data.info || '请求失败')
  },
  error => {
    return Promise.reject(error)
  }
)

function generateRequestId(): string {
  return `req_${new Date().getTime()}${Math.random().toString(36).substr(2, 9)}`
}