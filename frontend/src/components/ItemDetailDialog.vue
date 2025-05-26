<template>
  <el-dialog
    v-model="visible"
    :title="item?.name || '物品详情'"
    width="800px"
    :before-close="handleClose"
  >
    <div v-if="item" class="item-detail">
      <!-- 图片展示 -->
      <div class="image-section" v-if="item.imageUrls && item.imageUrls.length > 0">
        <el-carousel height="300px" indicator-position="outside">
          <el-carousel-item v-for="(url, index) in item.imageUrls" :key="index">
            <img :src="url" :alt="`${item.name} - 图片${index + 1}`" class="detail-image" />
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 基本信息 -->
      <div class="info-section">
        <h3>基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="物品名称">
            {{ item.name }}
          </el-descriptions-item>
          <el-descriptions-item label="价格">
            <span class="price">{{ item.price ? `¥${item.price}` : '未设置' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="品牌" v-if="item.brand">
            {{ item.brand }}
          </el-descriptions-item>
          <el-descriptions-item label="型号" v-if="item.model">
            {{ item.model }}
          </el-descriptions-item>
          <el-descriptions-item label="状态" v-if="item.condition">
            <el-tag :type="getConditionType(item.condition) as any">
              {{ item.condition }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="购买日期" v-if="item.purchaseDate">
            {{ formatDate(item.purchaseDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="购买来源" v-if="item.source">
            {{ item.source }}
          </el-descriptions-item>
          <el-descriptions-item label="存放位置" v-if="item.location">
            {{ item.location }}
          </el-descriptions-item>
          <el-descriptions-item label="分类" v-if="item.category">
            <el-tag
              :color="item.category.color"
              :style="{ color: getTextColor(item.category.color || '') }"
            >
              {{ item.category.name }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="标签" v-if="item.tags && item.tags.length > 0">
            <div class="tags-container">
              <el-tag
                v-for="itemTag in item.tags"
                :key="itemTag.id"
                size="small"
                :color="itemTag.tag.color"
                :style="{ color: getTextColor(itemTag.tag.color || '') }"
                class="tag-item"
              >
                {{ itemTag.tag.name }}
              </el-tag>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2" v-if="item.description">
            {{ item.description }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2" v-if="item.notes">
            {{ item.notes }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 时间信息 -->
      <div class="time-section">
        <h3>时间信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(item.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(item.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Item } from '@/types'

interface Props {
  modelValue: boolean
  item: Item | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit', item: Item): void
  (e: 'delete', item: Item): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
}

const handleEdit = () => {
  if (props.item) {
    emit('edit', props.item)
  }
}

const handleDelete = () => {
  if (props.item) {
    emit('delete', props.item)
  }
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
  if (!backgroundColor) return '#000'
  
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000' : '#fff'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.item-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.image-section {
  margin-bottom: 24px;
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f5f7fa;
}

.info-section,
.time-section {
  margin-bottom: 24px;
}

.info-section h3,
.time-section h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.price {
  color: #f56c6c;
  font-weight: 600;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-item {
  margin: 0;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-carousel__indicator) {
  background-color: rgba(0, 0, 0, 0.3);
}

:deep(.el-carousel__indicator.is-active) {
  background-color: #409eff;
}
</style> 