import api from './index'
import type { Category, CreateCategoryForm, UpdateCategoryForm } from '@/types'

// 获取分类列表
export const getCategories = (): Promise<Category[]> => {
  return api.get('/categories')
}

// 获取单个分类
export const getCategory = (id: number): Promise<Category> => {
  return api.get(`/categories/${id}`)
}

// 创建分类
export const createCategory = (data: CreateCategoryForm): Promise<Category> => {
  return api.post('/categories', data)
}

// 更新分类
export const updateCategory = (id: number, data: UpdateCategoryForm): Promise<Category> => {
  return api.put(`/categories/${id}`, data)
}

// 删除分类
export const deleteCategory = (id: number): Promise<void> => {
  return api.delete(`/categories/${id}`)
} 