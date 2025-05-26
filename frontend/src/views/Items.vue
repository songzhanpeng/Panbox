<template>
  <div class="items-page space-y-6">
    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <div class="search-card backdrop-blur-xl bg-white/90 rounded-2xl p-6 shadow-lg border border-white/20">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- 搜索框 -->
          <div class="search-input-container col-span-1 md:col-span-2">
            <el-input
              v-model="searchQuery"
              placeholder="搜索物品名称、品牌、型号..."
              class="modern-search"
              size="large"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon class="text-gray-400"><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <!-- 分类筛选 -->
          <div class="filter-container">
            <el-select
              v-model="selectedCategory"
              placeholder="选择分类"
              class="modern-select w-full"
              size="large"
              clearable
              @change="handleCategoryChange"
            >
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              >
                <div class="flex items-center space-x-2">
                  <div 
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: category.color }"
                  ></div>
                  <span>{{ category.name }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
          
          <!-- 状态筛选 -->
          <div class="filter-container">
            <el-select
              v-model="selectedCondition"
              placeholder="选择状态"
              class="modern-select w-full"
              size="large"
              clearable
              @change="handleConditionChange"
            >
              <el-option 
                v-for="condition in conditionOptions"
                :key="condition.value"
                :label="condition.label"
                :value="condition.value"
              >
                <div class="flex items-center space-x-2">
                  <div 
                    class="w-3 h-3 rounded-full"
                    :class="condition.colorClass"
                  ></div>
                  <span>{{ condition.label }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
        </div>
        
        <!-- 筛选统计和重置 -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div class="filter-stats text-sm text-gray-600">
            共找到 <span class="font-semibold text-blue-600">{{ filteredItems.length }}</span> 个物品
            <span v-if="hasActiveFilters" class="ml-2 text-orange-600">
              (已筛选)
            </span>
          </div>
          <div class="filter-actions flex items-center space-x-3">
            <el-button 
              v-if="hasActiveFilters"
              size="small" 
              @click="resetFilters"
              class="reset-btn"
            >
              <el-icon class="mr-1"><RefreshLeft /></el-icon>
              重置筛选
            </el-button>
            <div class="view-toggle flex items-center space-x-1 p-1 bg-gray-100 rounded-lg">
              <button 
                class="view-btn"
                :class="{ 'active': viewMode === 'grid' }"
                @click="viewMode = 'grid'"
              >
                <el-icon><Grid /></el-icon>
              </button>
              <button 
                class="view-btn"
                :class="{ 'active': viewMode === 'list' }"
                @click="viewMode = 'list'"
              >
                <el-icon><List /></el-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 物品列表 -->
    <div class="items-container" v-loading="loading">
      <!-- 网格视图 -->
      <div 
        v-if="viewMode === 'grid'"
        class="items-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item-card group cursor-pointer animate-fade-in-up"
          @click="handleItemClick(item)"
        >
          <div class="item-content backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 overflow-hidden">
            <!-- 物品图片 -->
            <div class="item-image-container relative h-48 overflow-hidden">
              <img
                v-if="item.imageUrls && item.imageUrls.length > 0"
                :src="item.imageUrls[0]"
                :alt="item.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                @error="handleImageError"
              />
              <div v-else class="no-image h-full bg-gradient-to-br from-gray-100 to-gray-200 flex-center">
                <div class="text-center">
                  <el-icon class="text-gray-400 text-4xl mb-2"><Picture /></el-icon>
                  <span class="text-gray-500 text-sm">暂无图片</span>
                </div>
              </div>
              
              <!-- 状态标签 -->
              <div class="absolute top-3 right-3">
                <el-tag 
                  v-if="item.condition"
                  size="small" 
                  :type="getConditionType(item.condition) as any"
                  class="backdrop-blur-sm bg-white/80"
                >
                  {{ item.condition }}
                </el-tag>
              </div>
              
              <!-- 价格标签 -->
              <div v-if="item.price" class="absolute bottom-3 left-3">
                <div class="price-tag backdrop-blur-sm bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ¥{{ formatPrice(item.price) }}
                </div>
              </div>
            </div>

            <!-- 物品信息 -->
            <div class="item-info p-5">
              <h3 class="item-name text-lg font-bold text-gray-800 mb-2 truncate group-hover:text-blue-600 transition-colors">
                {{ item.name }}
              </h3>
              
              <p class="item-description text-sm text-gray-600 mb-3 line-clamp-2">
                {{ item.description || '暂无描述' }}
              </p>
              
              <!-- 元信息 -->
              <div class="item-meta space-y-2 mb-4">
                <div v-if="item.brand" class="meta-item flex items-center text-sm">
                  <span class="meta-label text-gray-500 w-12">品牌:</span>
                  <span class="meta-value text-gray-700 font-medium">{{ item.brand }}</span>
                </div>
                
                <div v-if="item.category" class="meta-item flex items-center text-sm">
                  <span class="meta-label text-gray-500 w-12">分类:</span>
                  <el-tag
                    size="small"
                    :color="item.category.color"
                    :style="{ color: getTextColor(item.category.color || '') }"
                    class="meta-tag"
                  >
                    {{ item.category.name }}
                  </el-tag>
                </div>
              </div>

              <!-- 标签 -->
              <div class="item-tags mb-4" v-if="item.tags && item.tags.length > 0">
                <div class="flex flex-wrap gap-1">
                  <el-tag
                    v-for="itemTag in item.tags.slice(0, 3)"
                    :key="itemTag.id"
                    size="small"
                    :color="itemTag.tag.color"
                    :style="{ color: getTextColor(itemTag.tag.color || '') }"
                    class="tag-item"
                  >
                    {{ itemTag.tag.name }}
                  </el-tag>
                  <span v-if="item.tags.length > 3" class="text-xs text-gray-400">
                    +{{ item.tags.length - 3 }}
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="item-actions flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <el-button 
                  size="small" 
                  type="primary"
                  class="flex-1 modern-btn-small"
                  @click.stop="handleEdit(item)"
                >
                  <el-icon class="mr-1"><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  class="modern-btn-small"
                  @click.stop="handleDelete(item)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="items-list space-y-4">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item-row group cursor-pointer animate-fade-in-up"
          @click="handleItemClick(item)"
        >
          <div class="item-content backdrop-blur-xl bg-white/90 rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
            <div class="flex items-center space-x-6">
              <!-- 缩略图 -->
              <div class="item-thumbnail w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  v-if="item.imageUrls && item.imageUrls.length > 0"
                  :src="item.imageUrls[0]"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                <div v-else class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex-center">
                  <el-icon class="text-gray-400 text-xl"><Picture /></el-icon>
                </div>
              </div>
              
              <!-- 物品信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-bold text-gray-800 mb-1 truncate group-hover:text-blue-600 transition-colors">
                      {{ item.name }}
                    </h3>
                    <p class="text-sm text-gray-600 mb-2 line-clamp-1">
                      {{ item.description || '暂无描述' }}
                    </p>
                    
                    <div class="flex items-center space-x-4 text-sm">
                      <span v-if="item.brand" class="text-gray-500">
                        品牌: <span class="text-gray-700 font-medium">{{ item.brand }}</span>
                      </span>
                      <span v-if="item.price" class="text-green-600 font-semibold">
                        ¥{{ formatPrice(item.price) }}
                      </span>
                      <el-tag
                        v-if="item.condition"
                        size="small"
                        :type="getConditionType(item.condition) as any"
                      >
                        {{ item.condition }}
                      </el-tag>
                    </div>
                  </div>
                  
                  <!-- 操作按钮 -->
                  <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <el-button 
                      size="small" 
                      type="primary"
                      @click.stop="handleEdit(item)"
                    >
                      <el-icon class="mr-1"><Edit /></el-icon>
                      编辑
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click.stop="handleDelete(item)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && filteredItems.length === 0" class="empty-state">
        <div class="empty-container backdrop-blur-xl bg-white/90 rounded-2xl p-12 shadow-lg border border-white/20 text-center">
          <div class="empty-icon w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex-center">
            <el-icon class="text-gray-400 text-4xl"><Box /></el-icon>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">暂无物品数据</h3>
          <p class="text-gray-600 mb-6">开始添加您的第一个物品吧</p>
          <el-button 
            type="primary" 
            size="large"
            class="modern-btn"
            @click="showAddDialog = true"
          >
            <el-icon class="mr-2"><Plus /></el-icon>
            添加第一个物品
          </el-button>
        </div>
      </div>
    </div>

    <!-- 添加物品对话框 -->
    <AddItemDialog
      v-model="showAddDialog"
      @success="handleAddSuccess"
    />

    <!-- 物品详情对话框 -->
    <ItemDetailDialog
      v-model="showDetailDialog"
      :item="selectedItem"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- 编辑物品对话框 -->
    <EditItemDialog
      v-model="showEditDialog"
      :item="editingItem"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getItems, deleteItem } from '@/api/items'
import { getCategories } from '@/api/categories'
import AddItemDialog from '@/components/AddItemDialog.vue'
import ItemDetailDialog from '@/components/ItemDetailDialog.vue'
import EditItemDialog from '@/components/EditItemDialog.vue'
import type { Item, Category } from '@/types'
import { 
  Search, 
  Grid, 
  List, 
  Picture, 
  Edit, 
  Delete, 
  Plus, 
  Box,
  RefreshLeft
} from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const items = ref<Item[]>([])
const categories = ref<Category[]>([])
const viewMode = ref<'grid' | 'list'>('grid')

// 搜索和筛选
const searchQuery = ref('')
const selectedCategory = ref<number | undefined>()
const selectedCondition = ref<string | undefined>()

// 对话框状态
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const showEditDialog = ref(false)
const selectedItem = ref<Item | null>(null)
const editingItem = ref<Item | null>(null)

// 状态选项
const conditionOptions = [
  { label: '全新', value: '全新', colorClass: 'bg-green-500' },
  { label: '九成新', value: '九成新', colorClass: 'bg-blue-500' },
  { label: '八成新', value: '八成新', colorClass: 'bg-yellow-500' },
  { label: '七成新', value: '七成新', colorClass: 'bg-orange-500' },
  { label: '二手', value: '二手', colorClass: 'bg-gray-500' },
  { label: '损坏', value: '损坏', colorClass: 'bg-red-500' },
]

// 计算属性
const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || selectedCondition.value
})

const filteredItems = computed(() => {
  let result = items.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.brand && item.brand.toLowerCase().includes(query)) ||
      (item.model && item.model.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query))
    )
  }

  if (selectedCategory.value) {
    result = result.filter(item => item.categoryId === selectedCategory.value)
  }

  if (selectedCondition.value) {
    result = result.filter(item => item.condition === selectedCondition.value)
  }

  return result
})

// 方法
const formatPrice = (price: number) => {
  return price.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
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

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleCategoryChange = () => {
  // 分类筛选逻辑已在计算属性中处理
}

const handleConditionChange = () => {
  // 状态筛选逻辑已在计算属性中处理
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = undefined
  selectedCondition.value = undefined
}

const handleItemClick = (item: Item) => {
  router.push(`/items/${item.id}`)
}

const handleEdit = (item: Item) => {
  editingItem.value = item
  showEditDialog.value = true
}

const handleDelete = async (item: Item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除物品 "${item.name}" 吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteItem(item.id)
    ElMessage.success('删除成功')
    await loadItems()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error.message || error))
    }
  }
}

const handleAddSuccess = () => {
  showAddDialog.value = false
  loadItems()
}

const handleEditSuccess = () => {
  showEditDialog.value = false
  loadItems()
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const loadItems = async () => {
  try {
    loading.value = true
    items.value = await getItems()
  } catch (error) {
    ElMessage.error('加载物品列表失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    categories.value = await getCategories()
  } catch (error) {
    ElMessage.error('加载分类列表失败')
  }
}

onMounted(() => {
  loadItems()
  loadCategories()
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modern-search :deep(.el-input__wrapper) {
  @apply bg-white/80 backdrop-blur-sm border-white/30 shadow-sm rounded-xl;
}

.modern-select :deep(.el-input__wrapper) {
  @apply bg-white/80 backdrop-blur-sm border-white/30 shadow-sm rounded-xl;
}

.view-btn {
  @apply p-2 rounded-md transition-all duration-200 text-gray-500;
}

.view-btn:hover {
  @apply text-gray-700 bg-white/50;
}

.view-btn.active {
  @apply text-blue-600 bg-white shadow-sm;
}

.modern-btn-small {
  @apply text-xs px-3 py-1 rounded-lg;
}

.price-tag {
  font-variant-numeric: tabular-nums;
}

.meta-tag {
  @apply text-xs;
}

.tag-item {
  @apply text-xs;
}

/* 动画延迟 */
.item-card:nth-child(1) { animation-delay: 0.1s; }
.item-card:nth-child(2) { animation-delay: 0.2s; }
.item-card:nth-child(3) { animation-delay: 0.3s; }
.item-card:nth-child(4) { animation-delay: 0.4s; }
.item-card:nth-child(5) { animation-delay: 0.5s; }
.item-card:nth-child(6) { animation-delay: 0.6s; }

.item-row:nth-child(1) { animation-delay: 0.1s; }
.item-row:nth-child(2) { animation-delay: 0.2s; }
.item-row:nth-child(3) { animation-delay: 0.3s; }
.item-row:nth-child(4) { animation-delay: 0.4s; }
.item-row:nth-child(5) { animation-delay: 0.5s; }

/* 响应式设计 */
@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: 1fr;
  }
  
  .search-card .grid {
    grid-template-columns: 1fr;
  }
  
  .filter-stats {
    text-align: center;
  }
  
  .filter-actions {
    justify-content: center;
    margin-top: 1rem;
  }
}
</style> 