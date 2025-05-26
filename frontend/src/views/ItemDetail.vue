<template>
  <div class="item-detail-page" v-loading="loading">
    <!-- 返回按钮 -->
    <div class="back-section mb-6">
      <el-button 
        @click="goBack" 
        class="back-button"
        size="large"
      >
        <el-icon class="mr-2"><ArrowLeft /></el-icon>
        返回物品列表
      </el-button>
    </div>

    <div v-if="item" class="item-detail-container">
      <!-- 主要内容区域 -->
      <div class="detail-content grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 左侧：图片展示 -->
        <div class="image-section">
          <div class="image-container backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div v-if="item.imageUrls && item.imageUrls.length > 0" class="image-carousel">
              <el-carousel 
                height="400px" 
                indicator-position="outside"
                arrow="hover"
                :autoplay="false"
              >
                <el-carousel-item v-for="(url, index) in item.imageUrls" :key="index">
                  <div class="carousel-image-container">
                    <img 
                      :src="url" 
                      :alt="`${item.name} - 图片${index + 1}`" 
                      class="detail-image w-full h-full object-cover"
                      @error="handleImageError"
                    />
                  </div>
                </el-carousel-item>
              </el-carousel>
            </div>
            <div v-else class="no-image-placeholder h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex-center">
              <div class="text-center">
                <el-icon class="text-gray-400 text-6xl mb-4"><Picture /></el-icon>
                <p class="text-gray-500 text-lg">暂无图片</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：物品信息 -->
        <div class="info-section">
          <div class="info-container backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-8">
            <!-- 标题和价格 -->
            <div class="header-section mb-6">
              <h1 class="item-title text-3xl font-bold text-gray-800 mb-3">{{ item.name }}</h1>
              <div class="price-section flex items-center justify-between mb-4">
                <div class="price-display">
                  <span v-if="item.price" class="price text-3xl font-bold text-green-600">
                    ¥{{ formatPrice(item.price) }}
                  </span>
                  <span v-else class="price text-lg text-gray-500">价格未设置</span>
                </div>
                <div class="status-badge">
                  <el-tag 
                    v-if="item.condition"
                    :type="getConditionType(item.condition) as any"
                    size="large"
                    class="px-4 py-2"
                  >
                    {{ item.condition }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 描述 -->
            <div v-if="item.description" class="description-section mb-6">
              <h3 class="section-title text-lg font-semibold text-gray-800 mb-3">物品描述</h3>
              <p class="description text-gray-600 leading-relaxed">{{ item.description }}</p>
            </div>

            <!-- 基本信息 -->
            <div class="basic-info-section mb-6">
              <h3 class="section-title text-lg font-semibold text-gray-800 mb-4">基本信息</h3>
              <div class="info-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="item.brand" class="info-item">
                  <span class="info-label text-gray-500">品牌</span>
                  <span class="info-value text-gray-800 font-medium">{{ item.brand }}</span>
                </div>
                <div v-if="item.model" class="info-item">
                  <span class="info-label text-gray-500">型号</span>
                  <span class="info-value text-gray-800 font-medium">{{ item.model }}</span>
                </div>
                <div v-if="item.category" class="info-item">
                  <span class="info-label text-gray-500">分类</span>
                  <el-tag
                    :color="item.category.color"
                    :style="{ color: getTextColor(item.category.color || '') }"
                    class="category-tag"
                  >
                    {{ item.category.name }}
                  </el-tag>
                </div>
                <div v-if="item.purchaseDate" class="info-item">
                  <span class="info-label text-gray-500">购买日期</span>
                  <span class="info-value text-gray-800 font-medium">{{ formatDate(item.purchaseDate) }}</span>
                </div>
                <div v-if="item.source" class="info-item">
                  <span class="info-label text-gray-500">购买来源</span>
                  <span class="info-value text-gray-800 font-medium">{{ item.source }}</span>
                </div>
                <div v-if="item.location" class="info-item">
                  <span class="info-label text-gray-500">存放位置</span>
                  <span class="info-value text-gray-800 font-medium">{{ item.location }}</span>
                </div>
              </div>
            </div>

            <!-- 标签 -->
            <div v-if="item.tags && item.tags.length > 0" class="tags-section mb-6">
              <h3 class="section-title text-lg font-semibold text-gray-800 mb-3">标签</h3>
              <div class="tags-container flex flex-wrap gap-2">
                <el-tag
                  v-for="itemTag in item.tags"
                  :key="itemTag.id"
                  :color="itemTag.tag.color"
                  :style="{ color: getTextColor(itemTag.tag.color || '') }"
                  class="tag-item"
                >
                  {{ itemTag.tag.name }}
                </el-tag>
              </div>
            </div>

            <!-- 备注 -->
            <div v-if="item.notes" class="notes-section mb-6">
              <h3 class="section-title text-lg font-semibold text-gray-800 mb-3">备注</h3>
              <p class="notes text-gray-600 leading-relaxed">{{ item.notes }}</p>
            </div>

            <!-- 操作按钮 -->
            <div class="actions-section">
              <div class="action-buttons flex space-x-4">
                <el-button 
                  type="primary" 
                  size="large"
                  class="flex-1 modern-btn bg-gradient-to-r from-blue-500 to-purple-600 border-none"
                  @click="handleEdit"
                >
                  <el-icon class="mr-2"><Edit /></el-icon>
                  编辑物品
                </el-button>
                <el-button 
                  type="danger" 
                  size="large"
                  @click="handleDelete"
                >
                  <el-icon class="mr-2"><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="time-info-section mt-8">
        <div class="time-container backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 class="section-title text-lg font-semibold text-gray-800 mb-4">时间信息</h3>
          <div class="time-grid grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="time-item">
              <span class="time-label text-gray-500">创建时间</span>
              <span class="time-value text-gray-800 font-medium">{{ formatDateTime(item.createdAt) }}</span>
            </div>
            <div class="time-item">
              <span class="time-label text-gray-500">更新时间</span>
              <span class="time-value text-gray-800 font-medium">{{ formatDateTime(item.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-container backdrop-blur-xl bg-white/90 rounded-2xl p-12 shadow-lg border border-white/20 text-center">
        <div class="empty-icon w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex-center">
          <el-icon class="text-gray-400 text-4xl"><Box /></el-icon>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">物品不存在</h3>
        <p class="text-gray-600 mb-6">您访问的物品可能已被删除或不存在</p>
        <el-button 
          type="primary" 
          size="large"
          @click="goBack"
        >
          返回物品列表
        </el-button>
      </div>
    </div>

    <!-- 编辑物品对话框 -->
    <EditItemDialog
      v-model="showEditDialog"
      :item="item"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getItem, deleteItem } from '@/api/items'
import EditItemDialog from '@/components/EditItemDialog.vue'
import type { Item } from '@/types'
import dayjs from 'dayjs'
import { 
  ArrowLeft, 
  Picture, 
  Edit, 
  Delete, 
  Box 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const item = ref<Item | null>(null)
const showEditDialog = ref(false)

const itemId = computed(() => {
  return parseInt(route.params.id as string)
})

const loadItem = async () => {
  try {
    loading.value = true
    item.value = await getItem(itemId.value)
  } catch (error) {
    console.error('加载物品详情失败:', error)
    ElMessage.error('加载物品详情失败')
  } finally {
    loading.value = false
  }
}

const formatPrice = (price: number) => {
  return price.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY年MM月DD日')
}

const formatDateTime = (dateString: string) => {
  return dayjs(dateString).format('YYYY年MM月DD日 HH:mm:ss')
}

const getConditionType = (condition: string) => {
  const typeMap: Record<string, string> = {
    '全新': 'success',
    '九成新': 'primary',
    '八成新': 'warning',
    '七成新': 'warning',
    '二手': 'info',
    '损坏': 'danger',
  }
  return typeMap[condition] || 'info'
}

const getTextColor = (backgroundColor: string) => {
  if (!backgroundColor) return '#000000'
  
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  return brightness > 128 ? '#000000' : '#ffffff'
}

const goBack = () => {
  router.push('/items')
}

const handleEdit = () => {
  showEditDialog.value = true
}

const handleEditSuccess = () => {
  showEditDialog.value = false
  loadItem() // 重新加载物品信息
}

const handleDelete = async () => {
  if (!item.value) return

  try {
    await ElMessageBox.confirm(
      `确定要删除物品 "${item.value.name}" 吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteItem(item.value.id)
    ElMessage.success('删除成功')
    router.push('/items')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error.message || error))
    }
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(() => {
  if (itemId.value) {
    loadItem()
  } else {
    ElMessage.error('无效的物品ID')
    router.push('/items')
  }
})
</script>

<style scoped>
.item-detail-page {
  @apply space-y-6;
}

.back-button {
  @apply backdrop-blur-sm bg-white/80 border-white/30 shadow-sm rounded-xl;
}

.back-button:hover {
  @apply shadow-md;
}

.carousel-image-container {
  @apply w-full h-full;
}

.detail-image {
  @apply transition-transform duration-300;
}

.detail-image:hover {
  @apply scale-105;
}

.section-title {
  @apply border-b border-gray-200 pb-2;
}

.info-item {
  @apply flex flex-col space-y-1;
}

.info-label {
  @apply text-sm font-medium;
}

.info-value {
  @apply text-base;
}

.time-item {
  @apply flex flex-col space-y-1;
}

.time-label {
  @apply text-sm font-medium;
}

.time-value {
  @apply text-base;
}

.category-tag,
.tag-item {
  @apply px-3 py-1 rounded-lg text-sm font-medium;
}

.modern-btn:hover {
  @apply shadow-xl;
  transform: translateY(-1px);
}

/* 轮播图样式 */
:deep(.el-carousel__indicator) {
  @apply bg-white/50 backdrop-blur-sm;
}

:deep(.el-carousel__indicator.is-active) {
  @apply bg-blue-500;
}

:deep(.el-carousel__arrow) {
  @apply bg-white/80 backdrop-blur-sm;
}

:deep(.el-carousel__arrow:hover) {
  @apply bg-white;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .detail-content {
    @apply grid-cols-1;
  }
  
  .info-grid {
    @apply grid-cols-1;
  }
  
  .time-grid {
    @apply grid-cols-1;
  }
  
  .action-buttons {
    @apply flex-col space-x-0 space-y-3;
  }
}
</style> 