<template>
  <div class="stats-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>统计分析</h2>
      <el-button @click="refreshData">
        <el-icon><Refresh /></el-icon>
        刷新数据
      </el-button>
    </div>

    <!-- 总体统计 -->
    <div class="overview-section">
      <h3>总体概览</h3>
      <div class="stats-cards" v-loading="loading">
        <el-card class="stat-card">
          <el-statistic
            title="物品总数"
            :value="stats.totalItems"
            suffix="个"
          >
            <template #prefix>
              <el-icon style="color: #409eff"><Box /></el-icon>
            </template>
          </el-statistic>
        </el-card>

        <el-card class="stat-card">
          <el-statistic
            title="总价值"
            :value="stats.totalValue"
            :precision="2"
            prefix="¥"
          >
            <template #prefix>
              <el-icon style="color: #67c23a"><Money /></el-icon>
            </template>
          </el-statistic>
        </el-card>

        <el-card class="stat-card">
          <el-statistic
            title="分类数量"
            :value="stats.totalCategories"
            suffix="个"
          >
            <template #prefix>
              <el-icon style="color: #e6a23c"><Folder /></el-icon>
            </template>
          </el-statistic>
        </el-card>

        <el-card class="stat-card">
          <el-statistic
            title="标签数量"
            :value="stats.totalTags"
            suffix="个"
          >
            <template #prefix>
              <el-icon style="color: #f56c6c"><PriceTag /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </div>
    </div>

    <!-- 分类统计 -->
    <div class="category-section">
      <h3>分类统计</h3>
      <div class="charts-container">
        <el-card class="chart-card">
          <template #header>
            <span>分类物品数量分布</span>
          </template>
          <div class="category-stats">
            <div
              v-for="category in categoryStats"
              :key="category.id"
              class="category-stat-item"
            >
              <div class="category-info">
                <div
                  class="category-color"
                  :style="{ backgroundColor: category.color }"
                ></div>
                <span class="category-name">{{ category.name }}</span>
              </div>
              <div class="category-value">
                <el-progress
                  :percentage="getCategoryPercentage(category.count)"
                  :color="category.color"
                  :show-text="false"
                />
                <span class="count">{{ category.count }}个</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="chart-card">
          <template #header>
            <span>分类价值分布</span>
          </template>
          <div class="category-stats">
            <div
              v-for="category in categoryValueStats"
              :key="category.id"
              class="category-stat-item"
            >
              <div class="category-info">
                <div
                  class="category-color"
                  :style="{ backgroundColor: category.color }"
                ></div>
                <span class="category-name">{{ category.name }}</span>
              </div>
              <div class="category-value">
                <el-progress
                  :percentage="getCategoryValuePercentage(category.value)"
                  :color="category.color"
                  :show-text="false"
                />
                <span class="count">¥{{ category.value.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 状态统计 -->
    <div class="condition-section">
      <h3>物品状态统计</h3>
      <el-card>
        <div class="condition-stats">
          <div
            v-for="condition in conditionStats"
            :key="condition.condition"
            class="condition-item"
          >
            <el-tag
              :type="getConditionType(condition.condition) as any"
              size="large"
            >
              {{ condition.condition }}
            </el-tag>
            <el-statistic
              :value="condition.count"
              suffix="个"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最近添加 -->
    <div class="recent-section">
      <h3>最近添加的物品</h3>
      <el-card>
        <div class="recent-items">
          <div
            v-for="item in recentItems"
            :key="item.id"
            class="recent-item"
          >
            <div class="item-image">
              <img
                v-if="item.imageUrls && item.imageUrls.length > 0"
                :src="item.imageUrls[0]"
                :alt="item.name"
              />
              <div v-else class="no-image">
                <el-icon><Picture /></el-icon>
              </div>
            </div>
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p>{{ item.description || '暂无描述' }}</p>
              <div class="item-meta">
                <span class="price">¥{{ item.price || 0 }}</span>
                <span class="date">{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getItems } from '@/api/items'
import { getCategories } from '@/api/categories'
import { getTags } from '@/api/tags'
import type { Item, Category, Tag } from '@/types'

interface Stats {
  totalItems: number
  totalValue: number
  totalCategories: number
  totalTags: number
}

interface CategoryStat {
  id: number
  name: string
  color: string
  count: number
  value: number
}

interface ConditionStat {
  condition: string
  count: number
}

const loading = ref(false)
const stats = ref<Stats>({
  totalItems: 0,
  totalValue: 0,
  totalCategories: 0,
  totalTags: 0,
})

const categoryStats = ref<CategoryStat[]>([])
const categoryValueStats = ref<CategoryStat[]>([])
const conditionStats = ref<ConditionStat[]>([])
const recentItems = ref<Item[]>([])

const loadData = async () => {
  try {
    loading.value = true
    
    const [items, categories, tags] = await Promise.all([
      getItems(),
      getCategories(),
      getTags(),
    ])

    // 计算总体统计
    stats.value = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.price || 0), 0),
      totalCategories: categories.length,
      totalTags: tags.length,
    }

    // 计算分类统计
    const categoryMap = new Map<number, CategoryStat>()
    categories.forEach(category => {
      categoryMap.set(category.id, {
        id: category.id,
        name: category.name,
        color: category.color || '#409eff',
        count: 0,
        value: 0,
      })
    })

    items.forEach(item => {
      if (item.categoryId && categoryMap.has(item.categoryId)) {
        const stat = categoryMap.get(item.categoryId)!
        stat.count++
        stat.value += item.price || 0
      }
    })

    categoryStats.value = Array.from(categoryMap.values())
      .filter(stat => stat.count > 0)
      .sort((a, b) => b.count - a.count)

    categoryValueStats.value = Array.from(categoryMap.values())
      .filter(stat => stat.value > 0)
      .sort((a, b) => b.value - a.value)

    // 计算状态统计
    const conditionMap = new Map<string, number>()
    items.forEach(item => {
      if (item.condition) {
        conditionMap.set(item.condition, (conditionMap.get(item.condition) || 0) + 1)
      }
    })

    conditionStats.value = Array.from(conditionMap.entries())
      .map(([condition, count]) => ({ condition, count }))
      .sort((a, b) => b.count - a.count)

    // 最近添加的物品
    recentItems.value = items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

const getCategoryPercentage = (count: number) => {
  if (stats.value.totalItems === 0) return 0
  return Math.round((count / stats.value.totalItems) * 100)
}

const getCategoryValuePercentage = (value: number) => {
  if (stats.value.totalValue === 0) return 0
  return Math.round((value / stats.value.totalValue) * 100)
}

const getConditionType = (condition: string) => {
  const typeMap: Record<string, string> = {
    '全新': 'success',
    '九成新': 'success',
    '八成新': '',
    '七成新': 'warning',
    '二手': 'warning',
    '损坏': 'danger',
  }
  return typeMap[condition] || ''
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stats-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.overview-section,
.category-section,
.condition-section,
.recent-section {
  margin-bottom: 32px;
}

.overview-section h3,
.category-section h3,
.condition-section h3,
.recent-section h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  text-align: center;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  min-height: 300px;
}

.category-stats {
  padding: 16px 0;
}

.category-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.category-info {
  display: flex;
  align-items: center;
  min-width: 120px;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
}

.category-name {
  font-size: 14px;
  color: #303133;
}

.category-value {
  display: flex;
  align-items: center;
  flex: 1;
  margin-left: 16px;
}

.category-value .el-progress {
  flex: 1;
  margin-right: 12px;
}

.count {
  font-size: 14px;
  color: #606266;
  min-width: 60px;
  text-align: right;
}

.condition-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  padding: 16px 0;
}

.condition-item {
  text-align: center;
}

.condition-item .el-tag {
  margin-bottom: 12px;
}

.recent-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.recent-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.recent-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 12px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #909399;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.item-info p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 14px;
  font-weight: 600;
  color: #f56c6c;
}

.date {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .condition-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recent-items {
    grid-template-columns: 1fr;
  }
}
</style> 