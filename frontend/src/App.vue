<template>
  <div id="app">
    <el-container class="min-h-screen">
      <!-- 侧边栏 -->
      <el-aside width="250px" class="bg-gray-50 border-r">
        <div class="p-4">
          <h1 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <el-icon class="mr-2"><Box /></el-icon>
            Panbox
          </h1>
          <el-menu
            :default-active="$route.path"
            router
            class="border-none bg-transparent"
          >
            <el-menu-item index="/">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/items">
              <el-icon><Grid /></el-icon>
              <span>物品管理</span>
            </el-menu-item>
            <el-menu-item index="/categories">
              <el-icon><Folder /></el-icon>
              <span>分类管理</span>
            </el-menu-item>
            <el-menu-item index="/tags">
              <el-icon><PriceTag /></el-icon>
              <span>标签管理</span>
            </el-menu-item>
            <el-menu-item index="/stats">
              <el-icon><DataAnalysis /></el-icon>
              <span>统计分析</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="p-0">
        <div class="bg-white shadow-sm border-b px-6 py-4">
          <div class="flex-between">
            <h2 class="text-lg font-semibold text-gray-800">
              {{ getPageTitle() }}
            </h2>
            <div class="flex items-center space-x-4">
              <el-button type="primary" @click="handleAddItem">
                <el-icon><Plus /></el-icon>
                添加物品
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <router-view />
        </div>
      </el-main>
    </el-container>

    <!-- 添加物品对话框 -->
    <AddItemDialog v-model="showAddDialog" @success="handleAddSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AddItemDialog from '@/components/AddItemDialog.vue'

const route = useRoute()
const router = useRouter()
const showAddDialog = ref(false)

const getPageTitle = () => {
  const titles: Record<string, string> = {
    '/': '首页概览',
    '/items': '物品管理',
    '/categories': '分类管理',
    '/tags': '标签管理',
    '/stats': '统计分析',
  }
  return titles[route.path] || '物品管理系统'
}

const handleAddItem = () => {
  showAddDialog.value = true
}

const handleAddSuccess = () => {
  showAddDialog.value = false
  // 如果当前不在物品页面，跳转到物品页面
  if (route.path !== '/items') {
    router.push('/items')
  }
}
</script>

<style scoped>
.el-menu-item {
  @apply rounded-lg mx-2 mb-1;
}

.el-menu-item:hover {
  @apply bg-blue-50;
}

.el-menu-item.is-active {
  @apply bg-blue-100 text-blue-600;
}
</style> 