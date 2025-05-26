import api from './index'
import type { Tag, CreateTagForm } from '@/types'

// 获取标签列表
export const getTags = async (): Promise<Tag[]> => {
  const response = await api.get<Tag[]>('/tags')
  return response.data
}

// 获取单个标签
export const getTag = async (id: number): Promise<Tag> => {
  const response = await api.get<Tag>(`/tags/${id}`)
  return response.data
}

// 创建标签
export const createTag = async (data: CreateTagForm): Promise<Tag> => {
  const response = await api.post<Tag>('/tags', data)
  return response.data
}

// 更新标签
export const updateTag = async (id: number, data: Partial<CreateTagForm>): Promise<Tag> => {
  const response = await api.patch<Tag>(`/tags/${id}`, data)
  return response.data
}

// 删除标签
export const deleteTag = async (id: number): Promise<void> => {
  await api.delete(`/tags/${id}`)
} 