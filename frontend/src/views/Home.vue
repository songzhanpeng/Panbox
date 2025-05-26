<template>
  <div class="home">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <el-card class="stat-card">
        <div class="flex items-center">
          <div class="stat-icon bg-blue-100 text-blue-600">
            <el-icon size="24"><Grid /></el-icon>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-800">{{ stats.totalItems }}</div>
            <div class="text-gray-500">物品总数</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="flex items-center">
          <div class="stat-icon bg-green-100 text-green-600">
            <el-icon size="24"><Money /></el-icon>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-800">¥{{ formatPrice(stats.totalValue) }}</div>
            <div class="text-gray-500">总价值</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="flex items-center">
          <div class="stat-icon bg-purple-100 text-purple-600">
            <el-icon size="24"><Folder /></el-icon>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-800">{{ stats.categoryStats.length }}</div>
            <div class="text-gray-500">分类数量</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分类统计 -->
    <el-card class="mb-8">
      <template #header>
        <div class="flex-between">
          <h3 class="text-lg font-semibold">分类统计</h3>
          <el-button type="primary" size="small" @click="$router.push('/categories')">
            管理分类
          </el-button>
        </div>
      </template>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="category in stats.categoryStats"
          :key="category.id"
          class="category-item p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          @click="viewCategoryItems(category.id)"
        >
          <div class="flex-between">
            <div>
              <div class="font-medium text-gray-800">{{ category.name }}</div>
              <div class="text-sm text-gray-500">{{ category.count }} 个物品</div>
            </div>
            <el-icon class="text-gray-400"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 最近添加的物品 -->
    <el-card>
      <template #header>
        <div class="flex-between">
          <h3 class="text-lg font-semibold">最近添加</h3>
          <el-button type="primary" size="small" @click="$router.push('/items')">
            查看全部
          </el-button>
        </div>
      </template>
      
      <div v-if="recentItems.length === 0" class="text-center py-8 text-gray-500">
        暂无物品，<el-button type="text" @click="$emit('add-item')">立即添加</el-button>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in recentItems"
          :key="item.id"
          class="item-card p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          @click="viewItem(item.id)"
        >
          <div class="flex items-start space-x-3">
            <div class="w-12 h-12 bg-gray-100 rounded-lg flex-center">
              <el-icon class="text-gray-400"><Box /></el-icon>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-800 truncate">{{ item.name }}</div>
              <div class="text-sm text-gray-500 truncate">{{ item.category?.name || '未分类' }}</div>
              <div class="text-sm text-gray-400">{{ formatDate(item.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getStats, getItems } from '@/api/items'
import type { StatsData, Item } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()

const stats = ref<StatsData>({
  totalItems: 0,
  totalValue: 0,
  categoryStats: [],
})

const recentItems = ref<Item[]>([])

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
.stat-card {
  @apply border-none shadow-sm;
}

.stat-icon {
  @apply w-12 h-12 rounded-lg flex-center;
}

.category-item:hover {
  @apply border-blue-200;
}

.item-card:hover {
  @apply border-blue-200;
}
</style> 