#!/bin/bash

# Panbox 部署脚本
# 使用方法: ./deploy.sh [版本号]
# 例如: ./deploy.sh v1.0.0

set -e

# 默认配置
DEFAULT_GITHUB_REPO="your-username/panbox"
DEFAULT_TAG="latest"

# 获取参数
GITHUB_REPO=${1:-$DEFAULT_GITHUB_REPO}
TAG=${2:-$DEFAULT_TAG}

echo "🚀 开始部署 Panbox..."
echo "📦 GitHub 仓库: $GITHUB_REPO"
echo "🏷️  镜像标签: $TAG"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查 docker-compose 是否存在
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ docker-compose 未安装"
    exit 1
fi

# 设置环境变量
export GITHUB_REPOSITORY=$GITHUB_REPO
export TAG=$TAG

echo "📥 拉取最新镜像..."
docker-compose -f docker-compose.prod.yml pull

echo "🛑 停止现有服务..."
docker-compose -f docker-compose.prod.yml down

echo "🚀 启动服务..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ 等待服务启动..."
sleep 10

echo "🔍 检查服务状态..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ 部署完成！"
echo ""
echo "📋 服务访问地址:"
echo "   前端: http://localhost:9527"
echo "   后端: http://localhost:3000"
echo "   MinIO 控制台: http://localhost:9001"
echo ""
echo "📝 查看日志:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 停止服务:"
echo "   docker-compose -f docker-compose.prod.yml down" 