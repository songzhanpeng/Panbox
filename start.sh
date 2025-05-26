#!/bin/bash

echo "🚀 启动 Panbox 个人物品统计系统"
echo "=================================="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "📦 正在启动服务..."

# 启动所有服务
docker-compose up --build -d

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "🌐 访问地址："
echo "  前端应用: http://localhost:5173"
echo "  后端 API: http://localhost:3000"
echo "  API 文档: http://localhost:3000/api"
echo "  MinIO 控制台: http://localhost:9001 (账号: minioadmin / minioadmin)"
echo ""
echo "📝 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"
echo ""
echo "🎉 开始使用 Panbox 管理您的物品吧！" 