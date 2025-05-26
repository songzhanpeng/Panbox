<template>
  <el-dialog
    v-model="visible"
    title="添加物品"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="物品名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入物品名称" />
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入物品描述"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="价格">
            <el-input-number
              v-model="form.price"
              :min="0"
              :precision="2"
              placeholder="0.00"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="购买日期">
            <el-date-picker
              v-model="form.purchaseDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="品牌">
            <el-input v-model="form.brand" placeholder="请输入品牌" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="型号">
            <el-input v-model="form.model" placeholder="请输入型号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分类">
            <el-select
              v-model="form.categoryId"
              placeholder="选择分类"
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select
              v-model="form.condition"
              placeholder="选择状态"
              style="width: 100%"
              clearable
            >
              <el-option label="全新" value="全新" />
              <el-option label="九成新" value="九成新" />
              <el-option label="八成新" value="八成新" />
              <el-option label="七成新" value="七成新" />
              <el-option label="二手" value="二手" />
              <el-option label="损坏" value="损坏" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="标签">
        <el-select
          v-model="form.tagIds"
          multiple
          placeholder="选择标签"
          style="width: 100%"
        >
          <el-option
            v-for="tag in tags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
          />
        </el-select>
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="购买来源">
            <el-input v-model="form.source" placeholder="如：淘宝、京东等" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="存放位置">
            <el-input v-model="form.location" placeholder="如：卧室、客厅等" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="2"
          placeholder="其他备注信息"
        />
      </el-form-item>

      <el-form-item label="图片">
        <el-upload
          v-model:file-list="fileList"
          action="#"
          list-type="picture-card"
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          accept="image/*"
          multiple
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type UploadFile } from 'element-plus'
import { createItem } from '@/api/items'
import { getCategories } from '@/api/categories'
import { getTags } from '@/api/tags'
import { uploadFiles } from '@/api/upload'
import type { CreateItemForm, Category, Tag } from '@/types'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const fileList = ref<UploadFile[]>([])

const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

const form = reactive<CreateItemForm>({
  name: '',
  description: '',
  price: undefined,
  purchaseDate: '',
  source: '',
  brand: '',
  model: '',
  condition: '',
  location: '',
  notes: '',
  categoryId: undefined,
  tagIds: [],
  imageUrls: [],
})

const rules = {
  name: [
    { required: true, message: '请输入物品名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' },
  ],
}

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      loadCategories()
      loadTags()
    }
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    resetForm()
  }
})

const loadCategories = async () => {
  try {
    categories.value = await getCategories()
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadTags = async () => {
  try {
    tags.value = await getTags()
  } catch (error) {
    console.error('加载标签失败:', error)
  }
}

const handleFileChange = (file: UploadFile) => {
  // 文件变化处理
}

const handleFileRemove = (file: UploadFile) => {
  // 文件移除处理
}

const uploadImages = async (): Promise<string[]> => {
  if (fileList.value.length === 0) return []

  try {
    const files = fileList.value
      .map(item => item.raw)
      .filter(Boolean) as File[]
    
    if (files.length === 0) return []

    const response = await uploadFiles(files)
    return response.urls || []
  } catch (error) {
    console.error('图片上传失败:', error)
    throw error
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // 上传图片
    const imageUrls = await uploadImages()
    
    // 创建物品
    const itemData = {
      ...form,
      imageUrls,
      purchaseDate: form.purchaseDate || undefined,
    }

    await createItem(itemData)
    
    ElMessage.success('物品添加成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('添加物品失败:', error)
    if (error instanceof Error) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  visible.value = false
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  fileList.value = []
  Object.assign(form, {
    name: '',
    description: '',
    price: undefined,
    purchaseDate: '',
    source: '',
    brand: '',
    model: '',
    condition: '',
    location: '',
    notes: '',
    categoryId: undefined,
    tagIds: [],
    imageUrls: [],
  })
}

onMounted(() => {
  visible.value = props.modelValue
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

:deep(.el-upload--picture-card) {
  width: 80px;
  height: 80px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 80px;
  height: 80px;
}
</style> 