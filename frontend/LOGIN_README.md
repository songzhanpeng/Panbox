# Panbox 前端登录功能说明

## 功能概述

Panbox 前端现已集成完整的用户认证系统，包括：

- 美观的登录页面
- 用户注册功能
- JWT Token 认证
- 路由守卫保护
- 用户状态管理
- 自动登录状态恢复

## 主要特性

### 1. 登录页面 (`/login`)
- 现代化的渐变背景设计
- 玻璃态效果的登录卡片
- 浮动动画装饰元素
- 表单验证和错误提示
- 响应式设计，支持移动端

### 2. 用户注册
- 弹窗式注册表单
- 密码确认验证
- 邮箱格式验证（可选）
- 注册成功后自动跳转登录

### 3. 认证状态管理
- 使用 Pinia 进行状态管理
- 自动保存和恢复登录状态
- Token 过期自动跳转登录页
- 用户角色权限管理

### 4. 路由保护
- 未登录用户自动跳转登录页
- 已登录用户无法访问登录页
- 基于 meta 字段的路由守卫

## 使用方法

### 默认管理员账户
- **用户名**: `admin`
- **密码**: `admin123`
- **角色**: 超级管理员

### 登录流程
1. 访问 `http://localhost:5173/login`
2. 输入用户名和密码
3. 点击登录按钮
4. 登录成功后自动跳转到首页

### 注册新用户
1. 在登录页面点击"立即注册"
2. 填写注册信息
3. 点击注册按钮
4. 注册成功后使用新账户登录

## 技术实现

### 状态管理 (Pinia Store)
```typescript
// 使用认证状态
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 检查登录状态
if (authStore.isLoggedIn) {
  // 用户已登录
}

// 获取用户信息
const user = authStore.user
const userRole = authStore.user?.role

// 登录
await authStore.login({ username, password })

// 登出
authStore.logout()
```

### API 调用
```typescript
// 自动添加 Authorization 头
import api from '@/api'

// 所有请求都会自动携带 token
const response = await api.get('/some-protected-endpoint')
```

### 路由守卫
```typescript
// 在路由配置中添加 meta 字段
{
  path: '/protected',
  component: ProtectedComponent,
  meta: { requiresAuth: true }  // 需要登录
}

{
  path: '/login',
  component: LoginComponent,
  meta: { requiresGuest: true }  // 只允许未登录用户访问
}
```

## 用户界面

### 主应用界面
- 侧边栏显示用户信息和角色
- 顶部导航栏包含用户菜单
- 用户菜单支持个人资料、设置、退出登录

### 用户角色显示
- 普通用户: "普通用户"
- 管理员: "管理员"  
- 超级管理员: "超级管理员"

## 安全特性

### Token 管理
- JWT Token 存储在 localStorage
- Token 过期自动清除并跳转登录页
- 请求拦截器自动添加 Authorization 头

### 路由保护
- 所有页面默认需要登录访问
- 未登录用户自动重定向到登录页
- 登录状态自动恢复和验证

### 错误处理
- 401 错误自动跳转登录页
- 网络错误友好提示
- 表单验证和错误反馈

## 测试

### 使用测试页面
1. 打开 `frontend/test-login.html`
2. 使用默认账户测试登录
3. 查看返回的用户信息和 Token

### 手动测试
1. 启动后端服务: `cd backend && npm run start:dev`
2. 启动前端服务: `cd frontend && npm run dev`
3. 访问 `http://localhost:5173`
4. 测试登录、注册、登出功能

## 故障排除

### 常见问题

1. **登录后页面空白**
   - 检查后端服务是否正常运行
   - 检查 API 地址配置是否正确
   - 查看浏览器控制台错误信息

2. **Token 过期问题**
   - 后端 Token 有效期为 7 天
   - 过期后会自动跳转登录页
   - 可以在后端配置中调整有效期

3. **CORS 错误**
   - 确保后端已配置 CORS
   - 检查前端 API 地址配置

### 环境变量配置
```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:3000
```

## 开发说明

### 添加新的受保护页面
```typescript
// 在路由配置中添加
{
  path: '/new-page',
  name: 'NewPage',
  component: () => import('@/views/NewPage.vue'),
  meta: { requiresAuth: true }
}
```

### 检查用户权限
```vue
<template>
  <div v-if="authStore.isAdmin">
    管理员专用功能
  </div>
  <div v-if="authStore.isSuperAdmin">
    超级管理员专用功能
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
</script>
```

## 更新日志

### v1.0.0
- ✅ 实现登录页面设计
- ✅ 集成用户认证 API
- ✅ 添加路由守卫
- ✅ 实现状态管理
- ✅ 添加用户界面显示
- ✅ 支持用户注册
- ✅ 自动登录状态恢复

### 后续计划
- 🔄 个人资料编辑功能
- 🔄 密码修改功能
- 🔄 记住登录状态选项
- 🔄 多语言支持
- 🔄 主题切换功能 