<template>
  <div class="items-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>物品管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加物品
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索物品名称、品牌、型号..."
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="selectedCategory"
            placeholder="选择分类"
            clearable
            @change="handleCategoryChange"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="selectedCondition"
            placeholder="选择状态"
            clearable
            @change="handleConditionChange"
          >
            <el-option label="全新" value="全新" />
            <el-option label="九成新" value="九成新" />
            <el-option label="八成新" value="八成新" />
            <el-option label="七成新" value="七成新" />
            <el-option label="二手" value="二手" />
            <el-option label="损坏" value="损坏" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 物品列表 -->
    <div class="items-grid" v-loading="loading">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="item-card"
        @click="handleItemClick(item)"
      >
        <!-- 物品图片 -->
        <div class="item-image">
          <img
            v-if="item.imageUrls && item.imageUrls.length > 0"
            :src="item.imageUrls[0]"
            :alt="item.name"
            @error="handleImageError"
          />
          <div v-else class="no-image">
            <el-icon size="40"><Picture /></el-icon>
            <span>暂无图片</span>
          </div>
        </div>

        <!-- 物品信息 -->
        <div class="item-info">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="item-description">{{ item.description || '暂无描述' }}</p>
          
          <div class="item-meta">
            <div class="meta-row">
              <span class="label">价格:</span>
              <span class="value price">
                {{ item.price ? `¥${item.price}` : '未设置' }}
              </span>
            </div>
            
            <div class="meta-row" v-if="item.brand">
              <span class="label">品牌:</span>
              <span class="value">{{ item.brand }}</span>
            </div>
            
            <div class="meta-row" v-if="item.condition">
              <span class="label">状态:</span>
              <el-tag size="small" :type="getConditionType(item.condition) as any">
                {{ item.condition }}
              </el-tag>
            </div>
            
            <div class="meta-row" v-if="item.category">
              <span class="label">分类:</span>
              <el-tag
                size="small"
                :color="item.category.color"
                :style="{ color: getTextColor(item.category.color || '') }"
              >
                {{ item.category.name }}
              </el-tag>
            </div>
          </div>

          <!-- 标签 -->
          <div class="item-tags" v-if="item.tags && item.tags.length > 0">
            <el-tag
              v-for="itemTag in item.tags"
              :key="itemTag.id"
              size="small"
              :color="itemTag.tag.color"
              :style="{ color: getTextColor(itemTag.tag.color || '') }"
            >
              {{ itemTag.tag.name }}
            </el-tag>
          </div>

          <!-- 操作按钮 -->
          <div class="item-actions">
            <el-button size="small" @click.stop="handleEdit(item)">
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click.stop="handleDelete(item)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && filteredItems.length === 0" class="empty-state">
        <el-empty description="暂无物品数据">
          <el-button type="primary" @click="showAddDialog = true">
            添加第一个物品
          </el-button>
        </el-empty>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getItems, deleteItem } from '@/api/items'
import { getCategories } from '@/api/categories'
import AddItemDialog from '@/components/AddItemDialog.vue'
import ItemDetailDialog from '@/components/ItemDetailDialog.vue'
import EditItemDialog from '@/components/EditItemDialog.vue'
import type { Item, Category } from '@/types'

const loading = ref(false)
const items = ref<Item[]>([])
const categories = ref<Category[]>([])

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

// 计算过滤后的物品列表
const filteredItems = computed(() => {
  let result = items.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.brand && item.brand.toLowerCase().includes(query)) ||
      (item.model && item.model.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query))
    )
  }

  // 分类过滤
  if (selectedCategory.value) {
    result = result.filter(item => item.categoryId === selectedCategory.value)
  }

  // 状态过滤
  if (selectedCondition.value) {
    result = result.filter(item => item.condition === selectedCondition.value)
  }

  return result
})

const loadItems = async () => {
  try {
    loading.value = true
    items.value = await getItems()
  } catch (error) {
    console.error('加载物品失败:', error)
    ElMessage.error('加载物品失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    categories.value = await getCategories()
  } catch (error) {
    console.error('加载分类失败:', error)
  }
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
  selectedItem.value = item
  showDetailDialog.value = true
}

const handleEdit = (item: Item) => {
  editingItem.value = item
  showEditDialog.value = true
  showDetailDialog.value = false
}

const handleDelete = async (item: Item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除物品"${item.name}"吗？此操作不可恢复。`,
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
    showDetailDialog.value = false
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除物品失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleAddSuccess = () => {
  loadItems()
}

const handleEditSuccess = () => {
  loadItems()
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
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

const getTextColor = (backgroundColor: string) => {
  // 简单的颜色对比度计算，返回合适的文字颜色
  if (!backgroundColor) return '#000'
  
  // 移除 # 号
  const hex = backgroundColor.replace('#', '')
  
  // 转换为 RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  return brightness > 128 ? '#000' : '#fff'
}

onMounted(() => {
  loadItems()
  loadCategories()
})
</script>

<style scoped>
.items-page {
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

.search-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  min-height: 200px;
}

.item-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.item-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.item-image {
  height: 200px;
  overflow: hidden;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #909399;
}

.no-image span {
  margin-top: 8px;
  font-size: 14px;
}

.item-info {
  padding: 16px;
}

.item-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  margin-bottom: 12px;
}

.meta-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 14px;
}

.meta-row .label {
  color: #909399;
  margin-right: 8px;
  min-width: 40px;
}

.meta-row .value {
  color: #303133;
}

.meta-row .value.price {
  color: #f56c6c;
  font-weight: 600;
}

.item-tags {
  margin-bottom: 12px;
}

.item-tags .el-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: 1fr;
  }
  
  .search-section .el-row {
    flex-direction: column;
  }
  
  .search-section .el-col {
    width: 100% !important;
    margin-bottom: 12px;
  }
}
</style> 