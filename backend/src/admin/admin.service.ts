import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // 获取用户统计信息
  async getUserStats() {
    console.log(`📊 [AdminService.getUserStats] 开始获取用户统计信息`);
    
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({
      where: { isActive: true },
    });
    const inactiveUsers = totalUsers - activeUsers;

    // 按角色统计
    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    // 最近30天注册用户
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // 每日注册统计（最近7天）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyRegistrations = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // 按日期分组统计
    const dailyStats = dailyRegistrations.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.role,
      })),
      recentUsers,
      dailyStats,
    };

    console.log(`✅ [AdminService.getUserStats] 用户统计信息获取成功`, { totalUsers, activeUsers, inactiveUsers });
    return stats;
  }

  // 获取用户列表
  async getUsers(page: number = 1, limit: number = 10, search?: string) {
    console.log(`🔍 [AdminService.getUsers] 获取用户列表`, { page, limit, search });
    
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { username: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const result = {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    console.log(`✅ [AdminService.getUsers] 用户列表获取成功 - 找到 ${users.length} 个用户，总计 ${total} 个`);
    return result;
  }

  // 更新用户状态
  async updateUserStatus(userId: number, isActive: boolean, currentUserId: number) {
    console.log(`🔄 [AdminService.updateUserStatus] 更新用户状态`, { userId, isActive, currentUserId });
    
    // 防止用户禁用自己
    if (userId === currentUserId) {
      console.error(`❌ [AdminService.updateUserStatus] 操作失败 - 不能禁用自己的账户`);
      throw new ForbiddenException('不能禁用自己的账户');
    }

    // 防止禁用其他超级管理员
    console.log(`🔍 [AdminService.updateUserStatus] 检查目标用户角色 - 用户ID: ${userId}`);
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (targetUser?.role === 'SUPER_ADMIN') {
      console.error(`❌ [AdminService.updateUserStatus] 操作失败 - 不能禁用超级管理员账户`);
      throw new ForbiddenException('不能禁用超级管理员账户');
    }

    console.log(`💾 [AdminService.updateUserStatus] 开始更新用户状态到数据库 - 用户ID: ${userId}`);
    const result = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    console.log(`✅ [AdminService.updateUserStatus] 用户状态更新成功 - 用户: ${result.username}, 状态: ${isActive ? '激活' : '禁用'}`);
    return result;
  }

  // 更新用户角色
  async updateUserRole(userId: number, role: string, currentUserId: number) {
    console.log(`👤 [AdminService.updateUserRole] 更新用户角色`, { userId, role, currentUserId });
    
    // 防止用户修改自己的角色
    if (userId === currentUserId) {
      console.error(`❌ [AdminService.updateUserRole] 操作失败 - 不能修改自己的角色`);
      throw new ForbiddenException('不能修改自己的角色');
    }

    console.log(`💾 [AdminService.updateUserRole] 开始更新用户角色到数据库 - 用户ID: ${userId}`);
    const result = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    console.log(`✅ [AdminService.updateUserRole] 用户角色更新成功 - 用户: ${result.username}, 新角色: ${role}`);
    return result;
  }

  // 删除用户
  async deleteUser(userId: number, currentUserId: number) {
    console.log(`🗑️ [AdminService.deleteUser] 删除用户`, { userId, currentUserId });
    
    // 防止用户删除自己
    if (userId === currentUserId) {
      console.error(`❌ [AdminService.deleteUser] 操作失败 - 不能删除自己的账户`);
      throw new ForbiddenException('不能删除自己的账户');
    }

    // 防止删除其他超级管理员
    console.log(`🔍 [AdminService.deleteUser] 检查目标用户角色 - 用户ID: ${userId}`);
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (targetUser?.role === 'SUPER_ADMIN') {
      console.error(`❌ [AdminService.deleteUser] 操作失败 - 不能删除超级管理员账户`);
      throw new ForbiddenException('不能删除超级管理员账户');
    }

    console.log(`💾 [AdminService.deleteUser] 开始删除用户 - 用户ID: ${userId}`);
    const result = await this.prisma.user.delete({
      where: { id: userId },
    });

    console.log(`✅ [AdminService.deleteUser] 用户删除成功 - 用户: ${targetUser?.username}, ID: ${userId}`);
    return result;
  }

  // 获取系统统计信息
  async getSystemStats() {
    console.log(`📊 [AdminService.getSystemStats] 开始获取系统统计信息`);
    
    const [userCount, itemCount, categoryCount, tagCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.item.count(),
      this.prisma.category.count(),
      this.prisma.tag.count(),
    ]);

    const stats = {
      userCount,
      itemCount,
      categoryCount,
      tagCount,
    };

    console.log(`✅ [AdminService.getSystemStats] 系统统计信息获取成功`, stats);
    return stats;
  }
} 