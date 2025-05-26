<template>
  <div class="categories-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>分类管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加分类
      </el-button>
    </div>

    <!-- 分类列表 -->
    <div class="categories-grid" v-loading="loading">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-card"
      >
        <div class="category-header">
          <div class="category-info">
            <div
              class="category-color"
              :style="{ backgroundColor: category.color }"
            ></div>
            <div class="category-details">
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-description">
                {{ category.description || '暂无描述' }}
              </p>
            </div>
          </div>
          <div class="category-actions">
            <el-button size="small" @click="handleEdit(category)">
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(category)"
            >
              删除
            </el-button>
          </div>
        </div>
        
        <div class="category-stats">
          <el-statistic
            title="物品数量"
            :value="category._count?.items || 0"
            suffix="个"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && categories.length === 0" class="empty-state">
        <el-empty description="暂无分类数据">
          <el-button type="primary" @click="showAddDialog = true">
            添加第一个分类
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 添加分类对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加分类"
      width="500px"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="addForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="addForm.color" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="addForm.icon" placeholder="图标名称（可选）" />
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

    <!-- 编辑分类对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑分类"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="editForm.color" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="editForm.icon" placeholder="图标名称（可选）" />
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
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/categories'
import type { Category, CreateCategoryForm, UpdateCategoryForm } from '@/types'

const loading = ref(false)
const addLoading = ref(false)
const editLoading = ref(false)
const categories = ref<Category[]>([])

// 对话框状态
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const editingCategory = ref<Category | null>(null)

// 表单引用
const addFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()

// 表单数据
const addForm = reactive<CreateCategoryForm>({
  name: '',
  description: '',
  color: '#409EFF',
  icon: '',
})

const editForm = reactive<UpdateCategoryForm>({
  name: '',
  description: '',
  color: '#409EFF',
  icon: '',
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' },
  ],
}

const loadCategories = async () => {
  try {
    loading.value = true
    categories.value = await getCategories()
  } catch (error) {
    console.error('加载分类失败:', error)
    ElMessage.error('加载分类失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = async () => {
  if (!addFormRef.value) return

  try {
    await addFormRef.value.validate()
    addLoading.value = true

    await createCategory(addForm)
    ElMessage.success('分类添加成功')
    
    showAddDialog.value = false
    resetAddForm()
    await loadCategories()
  } catch (error) {
    console.error('添加分类失败:', error)
    if (error instanceof Error) {
      ElMessage.error(error.message)
    }
  } finally {
    addLoading.value = false
  }
}

const handleEdit = (category: Category) => {
  editingCategory.value = category
  Object.assign(editForm, {
    name: category.name,
    description: category.description || '',
    color: category.color || '#409EFF',
    icon: category.icon || '',
  })
  showEditDialog.value = true
}

const handleUpdate = async () => {
  if (!editFormRef.value || !editingCategory.value) return

  try {
    await editFormRef.value.validate()
    editLoading.value = true

    await updateCategory(editingCategory.value.id, editForm)
    ElMessage.success('分类更新成功')
    
    showEditDialog.value = false
    resetEditForm()
    await loadCategories()
  } catch (error) {
    console.error('更新分类失败:', error)
    if (error instanceof Error) {
      ElMessage.error(error.message)
    }
  } finally {
    editLoading.value = false
  }
}

const handleDelete = async (category: Category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${category.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteCategory(category.id)
    ElMessage.success('删除成功')
    await loadCategories()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const resetAddForm = () => {
  if (addFormRef.value) {
    addFormRef.value.resetFields()
  }
  Object.assign(addForm, {
    name: '',
    description: '',
    color: '#409EFF',
    icon: '',
  })
}

const resetEditForm = () => {
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
  Object.assign(editForm, {
    name: '',
    description: '',
    color: '#409EFF',
    icon: '',
  })
  editingCategory.value = null
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.categories-page {
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  min-height: 200px;
}

.category-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s ease;
}

.category-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.category-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.category-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 12px;
  flex-shrink: 0;
  border: 1px solid #dcdfe6;
}

.category-details {
  flex: 1;
}

.category-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.category-description {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.category-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.category-stats {
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
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .category-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .category-actions {
    align-self: stretch;
  }
}
</style> 