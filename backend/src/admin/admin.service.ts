import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // 获取用户统计信息
  async getUserStats() {
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

    return {
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
  }

  // 获取用户列表
  async getUsers(page: number = 1, limit: number = 10, search?: string) {
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

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 更新用户状态
  async updateUserStatus(userId: number, isActive: boolean, currentUserId: number) {
    // 防止用户禁用自己
    if (userId === currentUserId) {
      throw new ForbiddenException('不能禁用自己的账户');
    }

    // 防止禁用其他超级管理员
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (targetUser?.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('不能禁用超级管理员账户');
    }

    return this.prisma.user.update({
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
  }

  // 更新用户角色
  async updateUserRole(userId: number, role: string, currentUserId: number) {
    // 防止用户修改自己的角色
    if (userId === currentUserId) {
      throw new ForbiddenException('不能修改自己的角色');
    }

    return this.prisma.user.update({
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
  }

  // 删除用户
  async deleteUser(userId: number, currentUserId: number) {
    // 防止用户删除自己
    if (userId === currentUserId) {
      throw new ForbiddenException('不能删除自己的账户');
    }

    // 防止删除其他超级管理员
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (targetUser?.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('不能删除超级管理员账户');
    }

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  // 获取系统统计信息
  async getSystemStats() {
    const [userCount, itemCount, categoryCount, tagCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.item.count(),
      this.prisma.category.count(),
      this.prisma.tag.count(),
    ]);

    return {
      userCount,
      itemCount,
      categoryCount,
      tagCount,
    };
  }
} 