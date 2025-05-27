import api from './index'
import type { LoginForm, RegisterForm, LoginResponse, User } from '@/types'

// 用户登录
export const login = (data: LoginForm): Promise<LoginResponse> => {
  return api.post('/auth/login', data)
}

// 用户注册
export const register = (data: RegisterForm): Promise<User> => {
  return api.post('/auth/register', data)
}

// 获取用户信息
export const getProfile = (): Promise<User> => {
  return api.get('/auth/profile')
}

// 刷新token（如果后端支持）
export const refreshToken = (): Promise<{ access_token: string }> => {
  return api.post('/auth/refresh')
} 