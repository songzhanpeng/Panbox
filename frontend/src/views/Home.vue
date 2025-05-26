<template>
  <div class="home space-y-8">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-card backdrop-blur-xl bg-gradient-to-br from-white/90 to-blue-50/90 rounded-3xl p-8 shadow-xl border border-white/20">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              欢迎回来！
            </h1>
            <p class="text-gray-600">今天是 {{ getCurrentDate() }}，让我们一起管理您的物品吧</p>
          </div>
          <div class="welcome-icon w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex-center shadow-lg">
            <el-icon class="text-white text-3xl"><Sunny /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="stat-card group">
        <div class="card-content backdrop-blur-xl bg-gradient-to-br from-white/90 to-blue-50/90 rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div class="flex items-center justify-between mb-4">
            <div class="stat-icon w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <el-icon class="text-white text-xl"><Grid /></el-icon>
            </div>
            <div class="trend-indicator px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              +12%
            </div>
          </div>
          <div class="stat-number text-3xl font-bold text-gray-800 mb-1">{{ stats.totalItems }}</div>
          <div class="stat-label text-gray-600 text-sm">物品总数</div>
          <div class="progress-bar mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="progress-fill h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style="width: 75%"></div>
          </div>
        </div>
      </div>

      <div class="stat-card group">
        <div class="card-content backdrop-blur-xl bg-gradient-to-br from-white/90 to-green-50/90 rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div class="flex items-center justify-between mb-4">
            <div class="stat-icon w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <el-icon class="text-white text-xl"><Money /></el-icon>
            </div>
            <div class="trend-indicator px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              +8%
            </div>
          </div>
          <div class="stat-number text-3xl font-bold text-gray-800 mb-1">¥{{ formatPrice(stats.totalValue) }}</div>
          <div class="stat-label text-gray-600 text-sm">总价值</div>
          <div class="progress-bar mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="progress-fill h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style="width: 60%"></div>
          </div>
        </div>
      </div>

      <div class="stat-card group">
        <div class="card-content backdrop-blur-xl bg-gradient-to-br from-white/90 to-purple-50/90 rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div class="flex items-center justify-between mb-4">
            <div class="stat-icon w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <el-icon class="text-white text-xl"><Folder /></el-icon>
            </div>
            <div class="trend-indicator px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
              稳定
            </div>
          </div>
          <div class="stat-number text-3xl font-bold text-gray-800 mb-1">{{ stats.categoryStats.length }}</div>
          <div class="stat-label text-gray-600 text-sm">分类数量</div>
          <div class="progress-bar mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="progress-fill h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style="width: 45%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类统计 -->
    <div class="category-section">
      <div class="section-card backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20">
        <div class="section-header p-6 border-b border-gray-100">
          <div class="flex-between">
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-1">分类统计</h3>
              <p class="text-gray-600 text-sm">查看各分类的物品分布情况</p>
            </div>
            <el-button 
              type="primary" 
              class="modern-button bg-gradient-to-r from-blue-500 to-purple-600 border-none shadow-md hover:shadow-lg transition-all duration-300"
              @click="$router.push('/categories')"
            >
              <el-icon class="mr-2"><Setting /></el-icon>
              管理分类
            </el-button>
          </div>
        </div>
        
        <div class="section-content p-6">
          <div v-if="stats.categoryStats.length === 0" class="empty-state text-center py-12">
            <div class="empty-icon w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex-center">
              <el-icon class="text-gray-400 text-2xl"><FolderOpened /></el-icon>
            </div>
            <p class="text-gray-500 mb-4">暂无分类数据</p>
            <el-button type="primary" @click="$router.push('/categories')">创建分类</el-button>
          </div>
          
          <div v-else class="category-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="category in stats.categoryStats"
              :key="category.id"
              class="category-item group cursor-pointer"
              @click="viewCategoryItems(category.id)"
            >
              <div class="category-card p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 group-hover:-translate-y-1">
                <div class="flex items-center justify-between mb-3">
                  <div class="category-icon w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex-center group-hover:scale-110 transition-transform duration-300">
                    <el-icon class="text-blue-600"><Folder /></el-icon>
                  </div>
                  <el-icon class="text-gray-400 group-hover:text-blue-500 transition-colors duration-300"><ArrowRight /></el-icon>
                </div>
                <div class="category-name font-semibold text-gray-800 mb-1">{{ category.name }}</div>
                <div class="category-count text-sm text-gray-600">{{ category.count }} 个物品</div>
                <div class="category-progress mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="progress-fill h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                    :style="{ width: `${Math.min((category.count / Math.max(...stats.categoryStats.map(c => c.count))) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近添加的物品 -->
    <div class="recent-section">
      <div class="section-card backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20">
        <div class="section-header p-6 border-b border-gray-100">
          <div class="flex-between">
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-1">最近添加</h3>
              <p class="text-gray-600 text-sm">查看最新添加的物品</p>
            </div>
            <el-button 
              type="primary" 
              class="modern-button bg-gradient-to-r from-green-500 to-blue-600 border-none shadow-md hover:shadow-lg transition-all duration-300"
              @click="$router.push('/items')"
            >
              <el-icon class="mr-2"><View /></el-icon>
              查看全部
            </el-button>
          </div>
        </div>
        
        <div class="section-content p-6">
          <div v-if="recentItems.length === 0" class="empty-state text-center py-12">
            <div class="empty-icon w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex-center">
              <el-icon class="text-gray-400 text-2xl"><Box /></el-icon>
            </div>
            <p class="text-gray-500 mb-4">暂无物品，开始添加您的第一个物品吧</p>
            <el-button 
              type="primary" 
              class="bg-gradient-to-r from-blue-500 to-purple-600 border-none"
              @click="$emit('add-item')"
            >
              <el-icon class="mr-2"><Plus /></el-icon>
              立即添加
            </el-button>
          </div>
          
          <div v-else class="items-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="item in recentItems"
              :key="item.id"
              class="item-card group cursor-pointer"
              @click="viewItem(item.id)"
            >
              <div class="item-content p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 group-hover:-translate-y-1">
                <div class="flex items-start space-x-4">
                  <div class="item-avatar w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex-center group-hover:scale-110 transition-transform duration-300">
                    <el-icon class="text-gray-500 text-lg"><Box /></el-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="item-name font-semibold text-gray-800 truncate mb-1">{{ item.name }}</div>
                    <div class="item-category text-sm text-gray-600 truncate mb-2">{{ item.category?.name || '未分类' }}</div>
                    <div class="item-meta flex items-center justify-between">
                      <div class="item-date text-xs text-gray-400">{{ formatDate(item.createdAt) }}</div>
                      <div class="item-status px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        新增
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <div class="section-card backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20">
        <div class="section-header p-6 border-b border-gray-100">
          <h3 class="text-xl font-bold text-gray-800 mb-1">快速操作</h3>
          <p class="text-gray-600 text-sm">常用功能快速入口</p>
        </div>
        
        <div class="section-content p-6">
          <div class="actions-grid grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              v-for="action in quickActions"
              :key="action.name"
              class="action-item group cursor-pointer"
              @click="action.handler"
            >
              <div class="action-card p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 group-hover:-translate-y-1 text-center">
                <div class="action-icon w-12 h-12 mx-auto mb-3 rounded-xl flex-center group-hover:scale-110 transition-transform duration-300"
                     :class="action.iconClass">
                  <el-icon class="text-white text-lg"><component :is="action.icon" /></el-icon>
                </div>
                <div class="action-name font-medium text-gray-800 text-sm">{{ action.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getStats, getItems } from '@/api/items'
import type { StatsData, Item } from '@/types'
import dayjs from 'dayjs'
import { 
  Grid, 
  Money, 
  Folder, 
  Box, 
  ArrowRight, 
  Plus, 
  Setting, 
  View, 
  FolderOpened,
  Sunny,
  DataAnalysis,
  PriceTag
} from '@element-plus/icons-vue'

const router = useRouter()

const stats = ref<StatsData>({
  totalItems: 0,
  totalValue: 0,
  categoryStats: [],
})

const recentItems = ref<Item[]>([])

const quickActions = [
  {
    name: '添加物品',
    icon: Plus,
    iconClass: 'bg-gradient-to-br from-blue-500 to-blue-600',
    handler: () => router.push('/items')
  },
  {
    name: '管理分类',
    icon: Folder,
    iconClass: 'bg-gradient-to-br from-green-500 to-green-600',
    handler: () => router.push('/categories')
  },
  {
    name: '数据统计',
    icon: DataAnalysis,
    iconClass: 'bg-gradient-to-br from-purple-500 to-purple-600',
    handler: () => router.push('/stats')
  },
  {
    name: '标签管理',
    icon: PriceTag,
    iconClass: 'bg-gradient-to-br from-orange-500 to-orange-600',
    handler: () => router.push('/tags')
  }
]

const getCurrentDate = () => {
  return dayjs().format('YYYY年MM月DD日')
}

const formatPrice = (price: number) => {
  return price.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

const formatDate = (date: string) => {
  return dayjs(date).format('MM-DD HH:mm')
}

const viewCategoryItems = (categoryId: number) => {
  router.push(`/items?categoryId=${categoryId}`)
}

const viewItem = (itemId: number) => {
  router.push(`/items/${itemId}`)
}

const loadStats = async () => {
  try {
    stats.value = await getStats()
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadRecentItems = async () => {
  try {
    const items = await getItems({ limit: 6 })
    recentItems.value = items.slice(0, 6)
  } catch (error) {
    console.error('加载最近物品失败:', error)
  }
}

onMounted(() => {
  loadStats()
  loadRecentItems()
})
</script>

<style scoped>
.welcome-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.stat-card:hover .stat-icon {
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.progress-fill {
  animation: progressFill 1s ease-out;
}

@keyframes progressFill {
  from { width: 0%; }
}

.category-progress .progress-fill {
  animation: progressFill 1.5s ease-out;
}

.empty-state {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modern-button:hover {
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .category-grid {
    grid-template-columns: 1fr;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 