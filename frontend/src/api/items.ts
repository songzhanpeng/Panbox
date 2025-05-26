import api from './index'
import type { Item, CreateItemForm, StatsData, PaginationParams } from '@/types'

// 获取物品列表
export const getItems = async (params?: PaginationParams): Promise<Item[]> => {
  const response = await api.get<Item[]>('/items', { params })
  return response.data
}

// 获取单个物品
export const getItem = async (id: number): Promise<Item> => {
  const response = await api.get<Item>(`/items/${id}`)
  return response.data
}

// 创建物品
export const createItem = async (data: CreateItemForm): Promise<Item> => {
  const response = await api.post<Item>('/items', data)
  return response.data
}

// 更新物品
export const updateItem = async (id: number, data: Partial<CreateItemForm>): Promise<Item> => {
  const response = await api.patch<Item>(`/items/${id}`, data)
  return response.data
}

// 删除物品
export const deleteItem = async (id: number): Promise<void> => {
  await api.delete(`/items/${id}`)
}

// 获取统计数据
export const getStats = async (): Promise<StatsData> => {
  const response = await api.get<StatsData>('/items/stats')
  return response.data
} 