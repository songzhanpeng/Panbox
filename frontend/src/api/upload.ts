import api from './index'
import type { UploadResponse } from '@/types'

// 上传单个文件
export const uploadFile = (file: File): Promise<UploadResponse> => {
  console.log('📤 [UploadAPI.uploadFile] 上传单个文件', { 
    name: file.name, 
    size: file.size, 
    type: file.type 
  })
  
  const formData = new FormData()
  formData.append('file', file)
  
  return api.post('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 上传多个文件
export const uploadFiles = (files: File[]): Promise<UploadResponse> => {
  console.log('📤 [UploadAPI.uploadFiles] 上传多个文件', { 
    count: files.length,
    files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
  })
  
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  
  return api.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 删除文件
export const deleteFile = (fileUrl: string): Promise<void> => {
  console.log('🗑️ [UploadAPI.deleteFile] 删除文件', { fileUrl })
  return api.delete('/upload/delete', {
    data: { fileUrl },
  })
} 