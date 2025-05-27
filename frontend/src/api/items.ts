import api from './index'
import type { Item, CreateItemForm, UpdateItemForm, StatsData, PaginationParams } from '@/types'

// 获取物品列表
export const getItems = (params?: PaginationParams): Promise<Item[]> => {
  return api.get('/items', { params })
}

// 获取单个物品
export const getItem = (id: number): Promise<Item> => {
  return api.get(`/items/${id}`)
}

// 创建物品
export const createItem = (data: CreateItemForm): Promise<Item> => {
  return api.post('/items', data)
}

// 更新物品
export const updateItem = (id: number, data: UpdateItemForm): Promise<Item> => {
  return api.put(`/items/${id}`, data)
}

// 删除物品
export const deleteItem = (id: number): Promise<void> => {
  return api.delete(`/items/${id}`)
}

// 获取统计数据
export const getStats = (): Promise<StatsData> => {
  return api.get('/items/stats')
} 