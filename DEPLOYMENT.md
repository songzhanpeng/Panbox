# Panbox 自动镜像构建与部署指南

## 🎯 概述

本项目已配置了完整的 CI/CD 流程，支持自动构建和发布 Docker 镜像。当您推送带有版本标签的代码时，GitHub Actions 会自动：

1. 构建前端和后端 Docker 镜像
2. 推送镜像到 GitHub Container Registry (ghcr.io)
3. 创建 GitHub Release
4. 生成部署说明

## 🚀 快速开始

### 1. 发布新版本

```bash
# 1. 提交您的代码更改
git add .
git commit -m "feat: 添加新功能"
git push origin main

# 2. 创建并推送版本标签
git tag v1.0.0
git push origin v1.0.0
```

### 2. 自动化流程

推送标签后，GitHub Actions 会自动：
- ✅ 构建 Docker 镜像
- ✅ 推送到 ghcr.io
- ✅ 创建 GitHub Release
- ✅ 生成部署文档

### 3. 部署到生产环境

#### 方法一：使用部署脚本（推荐）

**Linux/macOS:**
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 部署最新版本
./deploy.sh your-username/panbox v1.0.0
```

**Windows:**
```cmd
# 部署最新版本
deploy.bat your-username/panbox v1.0.0
```

#### 方法二：手动部署

```bash
# 1. 设置环境变量
export GITHUB_REPOSITORY=your-username/panbox
export TAG=v1.0.0

# 2. 拉取镜像
docker-compose -f docker-compose.prod.yml pull

# 3. 启动服务
docker-compose -f docker-compose.prod.yml up -d
```

## 📦 镜像信息

### 镜像地址
- **后端镜像**: `ghcr.io/your-username/panbox/backend:TAG`
- **前端镜像**: `ghcr.io/your-username/panbox/frontend:TAG`

### 支持的标签
- `latest` - 最新版本
- `v1.0.0` - 具体版本号
- `main` - 主分支最新代码

## 🔧 配置说明

### GitHub Actions 工作流

#### 1. Docker 构建工作流 (`.github/workflows/docker-build-and-push.yml`)
- **触发条件**: 推送 `v*` 标签
- **功能**: 构建并推送 Docker 镜像
- **输出**: ghcr.io 镜像

#### 2. 发布工作流 (`.github/workflows/release.yml`)
- **触发条件**: 推送 `v*` 标签
- **功能**: 创建 GitHub Release
- **输出**: Release 页面和说明

### 环境变量配置

创建 `.env` 文件（基于 `.env.example`）：

```bash
# GitHub 仓库信息
GITHUB_REPOSITORY=your-username/panbox
TAG=v1.0.0

# 数据库配置
MYSQL_ROOT_PASSWORD=your-secure-password
MYSQL_DATABASE=panbox
MYSQL_USER=panbox
MYSQL_PASSWORD=your-secure-password

# MinIO 配置
MINIO_ROOT_USER=your-minio-admin
MINIO_ROOT_PASSWORD=your-secure-password

# 端口配置
BACKEND_PORT=3000
FRONTEND_PORT=5173
MYSQL_PORT=3306
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
```

## 🛠️ 开发环境 vs 生产环境

### 开发环境
- 使用 `docker-compose.yaml`
- 本地构建镜像
- 支持热重载
- 挂载源代码目录

### 生产环境
- 使用 `docker-compose.prod.yml`
- 使用预构建镜像
- 优化性能配置
- 不挂载源代码

## 📋 常用命令

### 查看服务状态
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 查看日志
```bash
# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### 停止服务
```bash
docker-compose -f docker-compose.prod.yml down
```

### 更新到新版本
```bash
# 1. 拉取新镜像
docker-compose -f docker-compose.prod.yml pull

# 2. 重启服务
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 权限配置

### GitHub Container Registry 权限

确保您的 GitHub 仓库有以下权限：
1. 在仓库设置中启用 "Actions" 权限
2. 在 "Actions" -> "General" 中设置 "Workflow permissions" 为 "Read and write permissions"

### 镜像访问权限

默认情况下，镜像是私有的。如需公开访问：
1. 进入 GitHub 包页面
2. 选择对应的包
3. 在 "Package settings" 中修改可见性

## 🚨 故障排除

### 常见问题

#### 1. 镜像拉取失败
```bash
# 登录到 GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

#### 2. 权限错误
- 检查 GitHub Actions 权限设置
- 确认 GITHUB_TOKEN 有足够权限

#### 3. 构建失败
- 检查 Dockerfile 语法
- 确认依赖项正确安装

### 调试命令

```bash
# 检查镜像是否存在
docker images | grep panbox

# 手动拉取镜像
docker pull ghcr.io/your-username/panbox/backend:v1.0.0

# 检查容器状态
docker ps -a
```

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [GitHub Container Registry 文档](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Compose 文档](https://docs.docker.com/compose/)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。 