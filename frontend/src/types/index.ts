// API 统一响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  timestamp: string
  data: T
}

// 分页响应格式
export interface PaginatedResponse<T = any> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

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

// 用户角色枚举
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// 用户接口
export interface User {
  id: number
  username: string
  email?: string
  role: UserRole
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

// 登录表单
export interface LoginForm {
  username: string
  password: string
}

// 注册表单
export interface RegisterForm {
  username: string
  password: string
  email?: string
}

// 登录响应
export interface LoginResponse {
  access_token: string
  user: User
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