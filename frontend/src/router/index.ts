import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/items',
    name: 'Items',
    component: () => import('@/views/Items.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/items/:id',
    name: 'ItemDetail',
    component: () => import('@/views/ItemDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/Categories.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('@/views/Tags.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('@/views/Stats.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  console.log(`🛣️ [Router] 路由守卫检查`, {
    from: from.path,
    to: to.path,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest
  })
  
  const authStore = useAuthStore()
  
  console.log(`🔍 [Router] 当前认证状态`, {
    hasToken: !!authStore.token,
    hasUser: !!authStore.user,
    isLoggedIn: authStore.isLoggedIn
  })
  
  // 如果有token但没有用户信息，尝试初始化认证状态
  if (authStore.token && !authStore.user) {
    console.log(`🔄 [Router] 检测到token但无用户信息，开始初始化认证状态`)
    try {
      await authStore.initAuth()
      console.log(`✅ [Router] 认证状态初始化成功`)
    } catch (error) {
      console.error('❌ [Router] 初始化认证状态失败:', error)
    }
  }

  // 需要登录的页面
  if (to.meta.requiresAuth) {
    console.log(`🔐 [Router] 页面需要认证，检查登录状态`)
    if (!authStore.isLoggedIn) {
      console.log(`❌ [Router] 用户未登录，跳转到登录页`)
      next('/login')
      return
    }
    console.log(`✅ [Router] 用户已登录，允许访问`)
  }

  // 只有游客可以访问的页面（如登录页）
  if (to.meta.requiresGuest) {
    console.log(`👤 [Router] 页面仅限游客访问，检查登录状态`)
    if (authStore.isLoggedIn) {
      console.log(`✅ [Router] 用户已登录，跳转到首页`)
      next('/')
      return
    }
    console.log(`👤 [Router] 用户未登录，允许访问游客页面`)
  }

  console.log(`✅ [Router] 路由守卫检查通过，继续导航`)
  next()
})

export default router 