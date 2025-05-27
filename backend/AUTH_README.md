# Panbox 认证系统使用说明

## 概述

Panbox 后端现已集成完整的用户认证和权限管理系统，包括：

- 用户注册和登录
- JWT 令牌认证
- 基于角色的权限控制
- 超级管理员功能

## 用户角色

系统支持三种用户角色：

1. **USER** - 普通用户：可以管理自己的物品
2. **ADMIN** - 管理员：具有更多管理权限
3. **SUPER_ADMIN** - 超级管理员：拥有所有权限，可以管理用户

## API 接口

### 认证接口

#### 用户注册
```
POST /auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com"  // 可选
}
```

#### 用户登录
```
POST /auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}

响应:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 获取用户信息
```
GET /auth/profile
Authorization: Bearer <access_token>

响应:
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "role": "USER",
  "isActive": true,
  "lastLogin": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 超级管理员接口

所有管理员接口都需要 `SUPER_ADMIN` 角色权限。

#### 获取用户统计信息
```
GET /admin/stats/users
Authorization: Bearer <super_admin_token>

响应:
{
  "totalUsers": 100,
  "activeUsers": 95,
  "inactiveUsers": 5,
  "usersByRole": [
    { "role": "USER", "count": 90 },
    { "role": "ADMIN", "count": 9 },
    { "role": "SUPER_ADMIN", "count": 1 }
  ],
  "recentUsers": 15,
  "dailyStats": {
    "2024-01-01": 5,
    "2024-01-02": 3,
    "2024-01-03": 7
  }
}
```

#### 获取系统统计信息
```
GET /admin/stats/system
Authorization: Bearer <super_admin_token>

响应:
{
  "userCount": 100,
  "itemCount": 1500,
  "categoryCount": 8,
  "tagCount": 20
}
```

#### 获取用户列表
```
GET /admin/users?page=1&limit=10&search=test
Authorization: Bearer <super_admin_token>

响应:
{
  "users": [
    {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "role": "USER",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "items": 25
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### 更新用户状态
```
PUT /admin/users/:id/status
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "isActive": false
}
```

#### 更新用户角色
```
PUT /admin/users/:id/role
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

#### 删除用户
```
DELETE /admin/users/:id
Authorization: Bearer <super_admin_token>
```

## 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# JWT配置
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# 数据库配置
DATABASE_URL="mysql://username:password@localhost:3306/panbox"
```

## 数据库迁移

1. 应用数据库迁移：
```bash
# 如果 Prisma 命令正常工作
pnpm prisma migrate dev

# 或者手动执行 SQL
# 将 prisma/migrations/20250526091060_add_user_auth/migration.sql 中的内容
# 手动执行到数据库中
```

2. 生成 Prisma 客户端：
```bash
pnpm prisma generate
```

3. 运行种子数据（创建超级管理员）：
```bash
pnpm prisma db seed
```

## 默认超级管理员账户

系统会自动创建一个默认的超级管理员账户：

- **用户名**: `admin`
- **密码**: `admin123`
- **邮箱**: `admin@panbox.com`
- **角色**: `SUPER_ADMIN`

**重要**: 在生产环境中，请立即修改默认密码！

## 权限保护

### 在控制器中使用权限保护

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('items')
@UseGuards(JwtAuthGuard) // 需要登录
export class ItemsController {
  
  @Get()
  async getItems(@Request() req) {
    // req.user 包含当前登录用户信息
    return this.itemsService.getItemsByUser(req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN') // 需要管理员权限
  async deleteItem(@Param('id') id: string) {
    return this.itemsService.deleteItem(+id);
  }
}
```

## 安全注意事项

1. **JWT 密钥**: 在生产环境中使用强密钥
2. **密码策略**: 建议实施更强的密码策略
3. **令牌过期**: 当前令牌有效期为 7 天，可根据需要调整
4. **HTTPS**: 生产环境中务必使用 HTTPS
5. **默认账户**: 及时修改默认超级管理员密码

## 故障排除

### Prisma 生成问题

如果遇到 Prisma 生成问题，可以尝试：

1. 手动执行数据库迁移 SQL
2. 删除 `node_modules/.prisma` 目录
3. 重新运行 `pnpm prisma generate`

### 依赖问题

确保安装了所有必要的依赖：

```bash
pnpm add @nestjs/jwt @nestjs/passport passport passport-local passport-jwt bcryptjs
pnpm add @types/passport-local @types/passport-jwt --save-dev
``` 