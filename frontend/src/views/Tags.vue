<template>
  <div class="tags-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>标签管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加标签
      </el-button>
    </div>

    <!-- 标签列表 -->
    <div class="tags-grid" v-loading="loading">
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="tag-card"
      >
        <div class="tag-header">
          <div class="tag-info">
            <el-tag
              :color="tag.color"
              :style="{ color: getTextColor(tag.color || '') }"
              size="large"
              class="tag-preview"
            >
              {{ tag.name }}
            </el-tag>
          </div>
          <div class="tag-actions">
            <el-button size="small" @click="handleEdit(tag)">
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(tag)"
            >
              删除
            </el-button>
          </div>
        </div>
        
        <div class="tag-stats">
          <el-statistic
            title="使用次数"
            :value="tag._count?.items || 0"
            suffix="次"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && tags.length === 0" class="empty-state">
        <el-empty description="暂无标签数据">
          <el-button type="primary" @click="showAddDialog = true">
            添加第一个标签
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 添加标签对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加标签"
      width="400px"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="addForm.color" />
        </el-form-item>
        <el-form-item label="预览">
          <el-tag
            :color="addForm.color"
            :style="{ color: getTextColor(addForm.color || '') }"
          >
            {{ addForm.name || '标签预览' }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="addLoading"
            @click="handleAdd"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑标签对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑标签"
      width="400px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="editForm.color" />
        </el-form-item>
        <el-form-item label="预览">
          <el-tag
            :color="editForm.color"
            :style="{ color: getTextColor(editForm.color || '') }"
          >
            {{ editForm.name || '标签预览' }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="editLoading"
            @click="handleUpdate"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { getTags, createTag, updateTag, deleteTag } from '@/api/tags'
import type { Tag, CreateTagForm, UpdateTagForm } from '@/types'

const loading = ref(false)
const addLoading = ref(false)
const editLoading = ref(false)
const tags = ref<Tag[]>([])

// 对话框状态
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const editingTag = ref<Tag | null>(null)

// 表单引用
const addFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()

// 表单数据
const addForm = reactive<CreateTagForm>({
  name: '',
  color: '#409EFF',
})

const editForm = reactive<UpdateTagForm>({
  name: '',
  color: '#409EFF',
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
  ],
}

const loadTags = async () => {
  try {
    loading.value = true
    tags.value = await getTags()
  } catch (error) {
    console.error('加载标签失败:', error)
    ElMessage.error('加载标签失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = async () => {
  if (!addFormRef.value) return

  try {
    await addFormRef.value.validate()
    addLoading.value = true

    await createTag(addForm)
    ElMessage.success('标签添加成功')
    
    showAddDialog.value = false
    resetAddForm()
    await loadTags()
  } catch (error) {
    console.error('添加标签失败:', error)
    if (error instanceof Error) {
      ElMessage.error(error.message)
    }
  } finally {
    addLoading.value = false
  }
}

const handleEdit = (tag: Tag) => {
  editingTag.value = tag
  Object.assign(editForm, {
    name: tag.name,
    color: tag.color || '#409EFF',
  })
  showEditDialog.value = true
}

const handleUpdate = async () => {
  if (!editFormRef.value || !editingTag.value) return

  try {
    await editFormRef.value.validate()
    editLoading.value = true

    await updateTag(editingTag.value.id, editForm)
    ElMessage.success('标签更新成功')
    
    showEditDialog.value = false
    resetEditForm()
    await loadTags()
  } catch (error) {
    console.error('更新标签失败:', error)
    if (error instanceof Error) {
      ElMessage.error(error.message)
    }
  } finally {
    editLoading.value = false
  }
}

const handleDelete = async (tag: Tag) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除标签"${tag.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteTag(tag.id)
    ElMessage.success('删除成功')
    await loadTags()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除标签失败:', error)
      ElMessage.error('删除失败')
    }
  }
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

const resetAddForm = () => {
  if (addFormRef.value) {
    addFormRef.value.resetFields()
  }
  Object.assign(addForm, {
    name: '',
    color: '#409EFF',
  })
}

const resetEditForm = () => {
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
  Object.assign(editForm, {
    name: '',
    color: '#409EFF',
  })
  editingTag.value = null
}

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.tags-page {
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

.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  min-height: 200px;
}

.tag-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s ease;
}

.tag-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tag-info {
  flex: 1;
}

.tag-preview {
  font-size: 14px;
  padding: 8px 12px;
  border: none;
}

.tag-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.tag-stats {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .tags-grid {
    grid-template-columns: 1fr;
  }
  
  .tag-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .tag-actions {
    align-self: stretch;
  }
}
</style> 