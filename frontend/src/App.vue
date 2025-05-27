<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <!-- 登录页面 -->
    <router-view v-if="$route.name === 'Login'" />
    
    <!-- 主应用界面 -->
    <el-container v-else-if="authStore.isLoggedIn" class="min-h-screen">
      <!-- 侧边栏 -->
      <el-aside width="280px" class="sidebar-container">
        <div class="sidebar-content backdrop-blur-xl bg-white/80 border-r border-white/20 shadow-xl">
          <div class="p-6">
            <!-- Logo区域 -->
            <div class="logo-section mb-8">
              <div class="flex items-center space-x-3">
                <div class="logo-icon w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex-center shadow-lg">
                  <el-icon class="text-white text-xl"><Box /></el-icon>
                </div>
                <div>
                  <h1 class="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Panbox
                  </h1>
                  <p class="text-xs text-gray-500">智能物品管理</p>
                </div>
              </div>
            </div>

            <!-- 用户信息 -->
            <div class="user-info mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-center">
                  <el-icon class="text-white text-sm"><User /></el-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ authStore.user?.username }}</p>
                  <p class="text-xs text-gray-500">{{ getRoleText(authStore.user?.role) }}</p>
                </div>
              </div>
            </div>

            <!-- 导航菜单 -->
            <nav class="space-y-2">
              <router-link
                v-for="item in menuItems"
                :key="item.path"
                :to="item.path"
                class="nav-item group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md"
                :class="{ 'nav-active': $route.path === item.path }"
              >
                <div class="nav-icon w-8 h-8 rounded-lg flex-center transition-all duration-300"
                     :class="$route.path === item.path ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-blue-600'">
                  <el-icon :size="16"><component :is="item.icon" /></el-icon>
                </div>
                <span class="font-medium transition-colors duration-300"
                      :class="$route.path === item.path ? 'text-gray-800' : 'text-gray-600 group-hover:text-gray-800'">
                  {{ item.title }}
                </span>
                <div v-if="$route.path === item.path" class="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
              </router-link>
            </nav>

            <!-- 底部信息 -->
            <div class="mt-8 pt-6 border-t border-gray-200/50">
              <div class="text-xs text-gray-400 text-center">
                Version 2.0.0
              </div>
            </div>
          </div>
        </div>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="p-0 main-content">
        <!-- 顶部导航栏 -->
        <header class="header-bar backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
          <div class="flex-between px-8 py-6">
            <div class="flex items-center space-x-4">
              <h2 class="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {{ getPageTitle() }}
              </h2>
              <div class="px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-xs font-medium text-blue-700">
                {{ getPageSubtitle() }}
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <!-- 搜索框 -->
              <div class="search-container relative">
                <el-input
                  placeholder="搜索物品..."
                  class="search-input w-64"
                  prefix-icon="Search"
                  clearable
                />
              </div>
              <!-- 添加按钮 -->
              <el-button 
                type="primary" 
                class="add-button bg-gradient-to-r from-blue-500 to-purple-600 border-none shadow-lg hover:shadow-xl transition-all duration-300"
                @click="handleAddItem"
              >
                <el-icon class="mr-2"><Plus /></el-icon>
                添加物品
              </el-button>
              
              <!-- 用户菜单 -->
              <el-dropdown @command="handleUserCommand">
                <div class="user-menu flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-center">
                    <el-icon class="text-white text-sm"><User /></el-icon>
                  </div>
                  <span class="text-sm font-medium text-gray-700">{{ authStore.user?.username }}</span>
                  <el-icon class="text-gray-400"><ArrowDown /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">
                      <el-icon class="mr-2"><User /></el-icon>
                      个人资料
                    </el-dropdown-item>
                    <el-dropdown-item command="settings">
                      <el-icon class="mr-2"><Setting /></el-icon>
                      设置
                    </el-dropdown-item>
                    <el-dropdown-item divided command="logout">
                      <el-icon class="mr-2"><SwitchButton /></el-icon>
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </header>
        
        <!-- 页面内容 -->
        <div class="page-content p-8">
          <router-view />
        </div>
      </el-main>
    </el-container>

    <!-- 加载状态 -->
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="loading-container">
        <el-icon class="loading-icon" size="48">
          <Loading />
        </el-icon>
        <p class="loading-text">正在加载...</p>
      </div>
    </div>

    <!-- 添加物品对话框 -->
    <AddItemDialog v-model="showAddDialog" @success="handleAddSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AddItemDialog from '@/components/AddItemDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types'
import { 
  HomeFilled, 
  Grid, 
  Folder, 
  PriceTag, 
  DataAnalysis,
  Box,
  Plus,
  Search,
  User,
  ArrowDown,
  Setting,
  SwitchButton,
  Loading
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const showAddDialog = ref(false)

const menuItems = [
  { path: '/', title: '首页概览', icon: HomeFilled, subtitle: '数据总览' },
  { path: '/items', title: '物品管理', icon: Grid, subtitle: '物品库存' },
  { path: '/categories', title: '分类管理', icon: Folder, subtitle: '分类体系' },
  { path: '/tags', title: '标签管理', icon: PriceTag, subtitle: '标签系统' },
  { path: '/stats', title: '统计分析', icon: DataAnalysis, subtitle: '数据洞察' },
]

const getPageTitle = () => {
  const item = menuItems.find(item => item.path === route.path)
  return item?.title || '物品管理系统'
}

const getPageSubtitle = () => {
  const item = menuItems.find(item => item.path === route.path)
  return item?.subtitle || '智能管理'
}

const getRoleText = (role?: UserRole) => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return '超级管理员'
    case UserRole.ADMIN:
      return '管理员'
    case UserRole.USER:
      return '普通用户'
    default:
      return '用户'
  }
}

const handleAddItem = () => {
  showAddDialog.value = true
}

const handleAddSuccess = () => {
  showAddDialog.value = false
  if (route.path !== '/items') {
    router.push('/items')
  }
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能开发中...')
      break
    case 'settings':
      ElMessage.info('设置功能开发中...')
      break
    case 'logout':
      authStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.sidebar-container {
  position: relative;
  z-index: 10;
}

.sidebar-content {
  height: 100vh;
  position: fixed;
  width: 280px;
  left: 0;
  top: 0;
}

.main-content {
  margin-left: 0;
}

.header-bar {
  position: sticky;
  top: 0;
  z-index: 5;
}

.page-content {
  min-height: calc(100vh - 88px);
}

.nav-item {
  text-decoration: none;
  display: flex;
}

.nav-active {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md;
}

.search-input :deep(.el-input__wrapper) {
  @apply bg-white/80 backdrop-blur-sm border-white/30 shadow-sm rounded-xl;
}

.search-input :deep(.el-input__wrapper:hover) {
  @apply shadow-md;
}

.add-button:hover {
  transform: translateY(-1px);
}

.logo-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}

/* 加载状态样式 */
.loading-container {
  text-align: center;
}

.loading-icon {
  color: #409EFF;
  animation: rotate 2s linear infinite;
}

.loading-text {
  margin-top: 16px;
  color: #666;
  font-size: 16px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-content {
    width: 100%;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .main-content {
    margin-left: 0;
  }
}
</style> 