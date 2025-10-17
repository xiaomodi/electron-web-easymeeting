import axios from 'axios'

export const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000
})

service.interceptors.request.use(
  config => {
    console.log("config", config)
    return config
  },
  error => {
    console.log("error", error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    console.log("response", response)
    return response
  },
  error => {
    console.log("error", error)
    return Promise.reject(error)
  }
)