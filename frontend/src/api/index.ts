import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 [API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params)
    
    // 添加认证 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('❌ [API Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data: responseData } = response
    
    console.log(`✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      code: responseData.code,
      message: responseData.message,
      data: responseData.data
    })
    
    // 检查业务状态码
    if (responseData.code !== 200 && responseData.code !== 201) {
      const errorMessage = responseData.message || '请求失败'
      console.error(`❌ [API Business Error] Code: ${responseData.code}, Message: ${errorMessage}`)
      ElMessage.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }
    
    // 返回实际数据
    return responseData.data
  },
  (error) => {
    console.error('❌ [API Response Error]', error)
    
    const message = error.response?.data?.message || error.message || '请求失败'
    
    // 如果是401错误，可能是token过期，需要跳转到登录页
    if (error.response?.status === 401) {
      console.warn('🔐 [API] Token过期或无效，清除本地token')
      // 清除本地token
      localStorage.removeItem('token')
      // 如果不是在登录页面，则跳转到登录页
      if (window.location.pathname !== '/login') {
        console.log('🔄 [API] 跳转到登录页')
        window.location.href = '/login'
      }
    } else {
      ElMessage.error(message)
    }
    
    return Promise.reject(error)
  }
)

export default api 