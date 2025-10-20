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

service.interceptors.request.use(
  config => {
    loading = ElLoading.service(loadingConfig)
    config.headers
      .set("Content-Type", "application/json")
      .set("X-Requested-With", "XMLHttpRequest")
    const token: string = getLocalStorage("token")
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`)
    }
    return config
  },
  error => {
    loading?.close()
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
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