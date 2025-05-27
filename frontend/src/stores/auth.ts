import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ElMessage } from 'element-plus'
import * as authApi from '@/api/auth'
import type { User, LoginForm, RegisterForm } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => {
    const result = !!token.value && !!user.value
    console.log('🔍 [AuthStore.isLoggedIn] 检查登录状态', {
      hasToken: !!token.value,
      hasUser: !!user.value,
      isLoggedIn: result
    })
    return result
  })
  const isAdmin = computed(() => user.value?.role === 'ADMIN' || user.value?.role === 'SUPER_ADMIN')
  const isSuperAdmin = computed(() => user.value?.role === 'SUPER_ADMIN')

  // 设置token
  const setToken = (newToken: string) => {
    console.log('🔑 [AuthStore.setToken] 设置token', { tokenLength: newToken.length })
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 清除token
  const clearToken = () => {
    console.log('🗑️ [AuthStore.clearToken] 清除token')
    token.value = null
    localStorage.removeItem('token')
  }

  // 设置用户信息
  const setUser = (userData: User) => {
    console.log('👤 [AuthStore.setUser] 设置用户信息', {
      id: userData.id,
      username: userData.username,
      role: userData.role
    })
    user.value = userData
  }

  // 清除用户信息
  const clearUser = () => {
    console.log('🗑️ [AuthStore.clearUser] 清除用户信息')
    user.value = null
  }

  // 登录
  const login = async (loginForm: LoginForm) => {
    try {
      console.log('🚪 [AuthStore.login] 开始登录流程', { username: loginForm.username })
      loading.value = true
      
      const response = await authApi.login(loginForm)
      console.log('✅ [AuthStore.login] 登录API成功', {
        hasToken: !!response.access_token,
        user: {
          id: response.user.id,
          username: response.user.username,
          role: response.user.role
        }
      })
      
      setToken(response.access_token)
      setUser(response.user)
      
      console.log('✅ [AuthStore.login] 认证状态更新完成', {
        isLoggedIn: isLoggedIn.value,
        hasToken: !!token.value,
        hasUser: !!user.value
      })
      
      ElMessage.success('登录成功')
      return response
    } catch (error: any) {
      console.error('❌ [AuthStore.login] 登录失败', error)
      ElMessage.error(error.response?.data?.message || '登录失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (registerForm: RegisterForm) => {
    try {
      console.log('📝 [AuthStore.register] 开始注册流程', { 
        username: registerForm.username, 
        email: registerForm.email 
      })
      loading.value = true
      
      const response = await authApi.register(registerForm)
      console.log('✅ [AuthStore.register] 注册成功', {
        id: response.id,
        username: response.username
      })
      
      ElMessage.success('注册成功，请登录')
      return response
    } catch (error: any) {
      console.error('❌ [AuthStore.register] 注册失败', error)
      ElMessage.error(error.response?.data?.message || '注册失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  const fetchProfile = async () => {
    try {
      console.log('👤 [AuthStore.fetchProfile] 获取用户信息')
      if (!token.value) {
        console.warn('⚠️ [AuthStore.fetchProfile] 没有token，跳过获取用户信息')
        return
      }
      
      const userData = await authApi.getProfile()
      console.log('✅ [AuthStore.fetchProfile] 获取用户信息成功', {
        id: userData.id,
        username: userData.username,
        role: userData.role
      })
      
      setUser(userData)
      return userData
    } catch (error: any) {
      console.error('❌ [AuthStore.fetchProfile] 获取用户信息失败', error)
      // 如果获取用户信息失败，可能是token过期
      if (error.response?.status === 401) {
        console.warn('🔐 [AuthStore.fetchProfile] Token过期，执行登出')
        logout()
      }
      throw error
    }
  }

  // 登出
  const logout = () => {
    console.log('🚪 [AuthStore.logout] 执行登出')
    clearToken()
    clearUser()
    ElMessage.success('已退出登录')
  }

  // 初始化认证状态
  const initAuth = async () => {
    console.log('🔄 [AuthStore.initAuth] 初始化认证状态', {
      hasToken: !!token.value,
      hasUser: !!user.value
    })
    
    if (token.value) {
      try {
        await fetchProfile()
        console.log('✅ [AuthStore.initAuth] 认证状态初始化成功')
      } catch (error) {
        console.error('❌ [AuthStore.initAuth] 认证状态初始化失败', error)
        // 如果获取用户信息失败，清除本地存储的token
        logout()
      }
    } else {
      console.log('ℹ️ [AuthStore.initAuth] 没有token，跳过初始化')
    }
  }

  return {
    // 状态
    user: readonly(user),
    token: readonly(token),
    loading: readonly(loading),
    
    // 计算属性
    isLoggedIn,
    isAdmin,
    isSuperAdmin,
    
    // 方法
    login,
    register,
    logout,
    fetchProfile,
    initAuth,
    setToken,
    setUser
  }
}) 