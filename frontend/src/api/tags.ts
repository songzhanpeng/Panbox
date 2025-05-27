import api from './index'
import type { Tag, CreateTagForm, UpdateTagForm } from '@/types'

// 获取标签列表
export const getTags = (): Promise<Tag[]> => {
  return api.get('/tags')
}

// 获取单个标签
export const getTag = (id: number): Promise<Tag> => {
  return api.get(`/tags/${id}`)
}

// 创建标签
export const createTag = (data: CreateTagForm): Promise<Tag> => {
  return api.post('/tags', data)
}

// 更新标签
export const updateTag = (id: number, data: UpdateTagForm): Promise<Tag> => {
  return api.put(`/tags/${id}`, data)
}

// 删除标签
export const deleteTag = (id: number): Promise<void> => {
  return api.delete(`/tags/${id}`)
} 