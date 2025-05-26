# 🧳 Panbox - 个人物品统计系统

> 万物皆可纳入的数字物品记录系统，支持图片上传、分类管理、搜索与统计。  
> 技术栈：Vue3 + UnoCSS + Element Plus · NestJS + Prisma + MySQL · MinIO · Docker部署

---

## ✨ 项目亮点

- 🗂️ 支持多类物品录入：衣物、数码、交通工具……全都可以！
- 🖼️ 图片上传绑定（使用 MinIO 存储）
- 📦 自动分类/标签（预留 AI 扩展接口）
- 🧾 详细信息记录（价格、购买时间、来源等）
- 🔍 快速搜索、筛选与修改
- 📦 前后端分离，容器化部署

---

## 🧱 技术栈

| 模块 | 技术 |
|------|------|
| 前端 | Vue 3 + Vite + UnoCSS + Element Plus |
| 后端 | NestJS + Prisma ORM |
| 数据库 | MySQL |
| 对象存储 | MinIO |
| 部署 | Docker + Docker Compose |

---

## 🗂️ 项目结构

```

panbox/
├── frontend/          # 前端 Vue3 应用
├── backend/           # 后端 NestJS 项目
├── prisma/            # Prisma schema 与迁移文件
├── docker-compose.yaml
├── README.md

````

---

## 🚀 快速启动

### ✅ 克隆项目

```bash
git clone https://github.com/your-username/panbox.git
cd panbox
```

### ✅ 一键启动（推荐）

**Windows 用户：**
```bash
start.bat
```

**Linux/Mac 用户：**
```bash
chmod +x start.sh
./start.sh
```

**手动启动：**
```bash
docker-compose up --build -d
```

### 🌐 访问地址

启动成功后，您可以访问以下地址：

* **前端应用**: [http://localhost:5173](http://localhost:5173) - 主要的用户界面
* **后端 API**: [http://localhost:3000](http://localhost:3000) - REST API 服务
* **API 文档**: [http://localhost:3000/api](http://localhost:3000/api) - Swagger 接口文档
* **MinIO 控制台**: [http://localhost:9001](http://localhost:9001) - 文件存储管理（账号密码：`minioadmin`）

### 📋 系统要求

- Docker 20.0+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

---

## ⚙️ 前端开发

```bash
cd frontend
pnpm install
pnpm dev
```

---

## ⚙️ 后端开发

```bash
cd backend
pnpm install
pnpm run start:dev
```

### 🧬 数据库迁移

```bash
cd backend
npx prisma migrate dev --name init
```

---

## 📸 MinIO 配置（图片上传）

上传图片至 MinIO（或使用表单接口），后端会返回图片 URL 并绑定到物品记录中。

默认 MinIO 连接配置在 `.env` 文件中：

```env
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=panbox-assets
```

---

## 🔐 简易认证（可选）

目前为个人使用，接口统一绑定 `user_id = 1`，如需安全控制可加入：

* 环境变量 token 校验
* JWT 认证中间件

---

## 🧠 AI 自动分类（预留）

后端预留 `/ai/classify` 接口，未来可接入：

* OpenAI Vision
* 百度图像识别
* HuggingFace 自托管模型

---

## 🎯 功能特性

### ✅ 已完成功能

* ✅ **物品管理** - 完整的增删查改功能
* ✅ **分类系统** - 支持自定义分类和颜色标识
* ✅ **标签系统** - 多标签支持，灵活标记
* ✅ **图片上传** - 基于 MinIO 的图片存储
* ✅ **搜索筛选** - 支持关键词搜索和分类筛选
* ✅ **统计分析** - 物品数量、价值统计
* ✅ **响应式设计** - 支持桌面和移动端
* ✅ **Docker 部署** - 一键启动所有服务
* ✅ **API 文档** - 完整的 Swagger 接口文档

### 🚧 开发中功能

* [ ] **AI 自动分类** - 基于图像识别的智能分类
* [ ] **数据导入导出** - 支持 Excel/CSV 格式
* [ ] **用户系统** - 多用户支持和权限管理
* [ ] **移动端 App** - 原生移动应用
* [ ] **数据备份** - 自动备份和恢复功能

## 📱 使用指南

### 1. 添加物品
- 点击右上角"添加物品"按钮
- 填写物品基本信息（名称、描述、价格等）
- 选择分类和标签
- 上传物品图片
- 保存即可

### 2. 管理分类
- 进入"分类管理"页面
- 创建新分类，设置名称、颜色和图标
- 编辑或删除现有分类

### 3. 管理标签
- 进入"标签管理"页面
- 创建标签，设置颜色标识
- 为物品添加多个标签

### 4. 查看统计
- 首页显示物品总数、总价值等统计信息
- "统计分析"页面提供更详细的数据分析

---

## 📄 License

MIT © 凌霄 | 2025