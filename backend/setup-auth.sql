-- Panbox 认证系统数据库设置脚本
-- 请在 MySQL 数据库中手动执行此脚本

-- 1. 创建用户角色枚举
CREATE TYPE UserRole AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- 2. 为用户表添加认证相关字段
ALTER TABLE users 
ADD COLUMN password TEXT NOT NULL DEFAULT '',
ADD COLUMN role UserRole NOT NULL DEFAULT 'USER',
ADD COLUMN isActive BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN lastLogin TIMESTAMP(3) NULL;

-- 3. 创建默认超级管理员用户（密码: admin123）
-- 注意：这是 bcrypt 加密后的密码哈希值
INSERT INTO users (username, email, password, role, isActive) 
VALUES (
  'admin', 
  'admin@panbox.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'SUPER_ADMIN', 
  true
) ON DUPLICATE KEY UPDATE 
  password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  role = 'SUPER_ADMIN',
  isActive = true;

-- 完成！现在可以使用以下账户登录：
-- 用户名: admin
-- 密码: admin123 