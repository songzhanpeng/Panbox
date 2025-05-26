import api from './index'
import type { Category, CreateCategoryForm } from '@/types'

// 获取分类列表
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/categories')
  return response.data
}

// 获取单个分类
export const getCategory = async (id: number): Promise<Category> => {
  const response = await api.get<Category>(`/categories/${id}`)
  return response.data
}

// 创建分类
export const createCategory = async (data: CreateCategoryForm): Promise<Category> => {
  const response = await api.post<Category>('/categories', data)
  return response.data
}

// 更新分类
export const updateCategory = async (id: number, data: Partial<CreateCategoryForm>): Promise<Category> => {
  const response = await api.patch<Category>(`/categories/${id}`, data)
  return response.data
}

// 删除分类
export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/categories/${id}`)
} 