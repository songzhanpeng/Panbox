// 物品接口
export interface Item {
  id: number
  name: string
  description?: string
  price?: number
  purchaseDate?: string
  source?: string
  brand?: string
  model?: string
  condition?: string
  location?: string
  notes?: string
  userId: number
  categoryId?: number
  imageUrls?: string[]
  createdAt: string
  updatedAt: string
  category?: Category
  tags?: ItemTag[]
}

// 分类接口
export interface Category {
  id: number
  name: string
  description?: string
  color?: string
  icon?: string
  createdAt: string
  updatedAt: string
  _count?: {
    items: number
  }
}

// 标签接口
export interface Tag {
  id: number
  name: string
  color?: string
  createdAt: string
  updatedAt: string
  _count?: {
    items: number
  }
}

// 物品标签关联接口
export interface ItemTag {
  id: number
  itemId: number
  tagId: number
  tag: Tag
}

// 创建物品表单
export interface CreateItemForm {
  name: string
  description?: string
  price?: number
  purchaseDate?: string
  source?: string
  brand?: string
  model?: string
  condition?: string
  location?: string
  notes?: string
  categoryId?: number
  tagIds?: number[]
  imageUrls?: string[]
}

// 创建分类表单
export interface CreateCategoryForm {
  name: string
  description?: string
  color?: string
  icon?: string
}

// 创建标签表单
export interface CreateTagForm {
  name: string
  color?: string
}

// 更新物品表单
export interface UpdateItemForm {
  name?: string
  description?: string
  price?: number
  purchaseDate?: string
  source?: string
  brand?: string
  model?: string
  condition?: string
  location?: string
  notes?: string
  categoryId?: number
  tagIds?: number[]
  imageUrls?: string[]
}

// 更新分类表单
export interface UpdateCategoryForm {
  name?: string
  description?: string
  color?: string
  icon?: string
}

// 更新标签表单
export interface UpdateTagForm {
  name?: string
  color?: string
}

// 统计数据接口
export interface StatsData {
  totalItems: number
  totalValue: number
  categoryStats: {
    id: number
    name: string
    count: number
  }[]
}

// API 响应接口
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success?: boolean
}

// 分页参数
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: number
}

// 上传文件响应
export interface UploadResponse {
  message: string
  url?: string
  urls?: string[]
} 