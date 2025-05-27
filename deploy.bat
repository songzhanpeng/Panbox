@echo off
setlocal enabledelayedexpansion

REM Panbox 部署脚本 (Windows)
REM 使用方法: deploy.bat [GitHub仓库] [版本号]
REM 例如: deploy.bat your-username/panbox v1.0.0

REM 默认配置
set DEFAULT_GITHUB_REPO=your-username/panbox
set DEFAULT_TAG=latest

REM 获取参数
if "%1"=="" (
    set GITHUB_REPO=%DEFAULT_GITHUB_REPO%
) else (
    set GITHUB_REPO=%1
)

if "%2"=="" (
    set TAG=%DEFAULT_TAG%
) else (
    set TAG=%2
)

echo 🚀 开始部署 Panbox...
echo 📦 GitHub 仓库: %GITHUB_REPO%
echo 🏷️  镜像标签: %TAG%

REM 检查 Docker 是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未运行，请先启动 Docker
    pause
    exit /b 1
)

REM 检查 docker-compose 是否存在
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ docker-compose 未安装
    pause
    exit /b 1
)

REM 设置环境变量
set GITHUB_REPOSITORY=%GITHUB_REPO%
set TAG=%TAG%

echo 📥 拉取最新镜像...
docker-compose -f docker-compose.prod.yml pull

echo 🛑 停止现有服务...
docker-compose -f docker-compose.prod.yml down

echo 🚀 启动服务...
docker-compose -f docker-compose.prod.yml up -d

echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

echo 🔍 检查服务状态...
docker-compose -f docker-compose.prod.yml ps

echo.
echo ✅ 部署完成！
echo.
echo 📋 服务访问地址:
echo    前端: http://localhost:5173
echo    后端: http://localhost:3000
echo    MinIO 控制台: http://localhost:9001
echo.
echo 📝 查看日志:
echo    docker-compose -f docker-compose.prod.yml logs -f
echo.
echo 🛑 停止服务:
echo    docker-compose -f docker-compose.prod.yml down
echo.
pause 