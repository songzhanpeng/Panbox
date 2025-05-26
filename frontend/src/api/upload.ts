import api from './index'
import type { UploadResponse } from '@/types'

// 上传单个文件
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post<UploadResponse>('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// 上传多个文件
export const uploadFiles = async (files: File[]): Promise<UploadResponse> => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  
  const response = await api.post<UploadResponse>('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
} 