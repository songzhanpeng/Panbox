import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ResponseUtil } from '../common/utils/response.util';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto, userId: number = 1) {
    const { tagIds, ...itemData } = createItemDto;

    const item = await this.prisma.item.create({
      data: {
        ...itemData,
        userId,
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return item;
  }

  async findAll(userId: number = 1, categoryId?: number, search?: string) {
    const where: any = { userId };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
      ];
    }

    return this.prisma.item.findMany({
      where,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userId: number = 1) {
    const item = await this.prisma.item.findFirst({
      where: { id, userId },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`物品 ID ${id} 不存在`);
    }

    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto, userId: number = 1) {
    const { tagIds, ...itemData } = updateItemDto;

    // 检查物品是否存在
    await this.findOne(id, userId);

    // 如果有标签更新，先删除旧的关联
    if (tagIds !== undefined) {
      await this.prisma.itemTag.deleteMany({
        where: { itemId: id },
      });
    }

    const item = await this.prisma.item.update({
      where: { id },
      data: {
        ...itemData,
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return item;
  }

  async remove(id: number, userId: number = 1) {
    // 检查物品是否存在
    await this.findOne(id, userId);

    return this.prisma.item.delete({
      where: { id },
    });
  }

  async getStats(userId: number = 1) {
    const totalItems = await this.prisma.item.count({
      where: { userId },
    });

    const totalValue = await this.prisma.item.aggregate({
      where: { userId },
      _sum: {
        price: true,
      },
    });

    const categoryStats = await this.prisma.category.findMany({
      include: {
        _count: {
          select: {
            items: {
              where: { userId },
            },
          },
        },
      },
    });

    return {
      totalItems,
      totalValue: totalValue._sum.price || 0,
      categoryStats: categoryStats.map((cat) => ({
        id: cat.id,
        name: cat.name,
        count: cat._count.items,
      })),
    };
  }
} 