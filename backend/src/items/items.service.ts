import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ResponseUtil } from '../common/utils/response.util';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto, userId: number = 1) {
    console.log(`📝 [ItemsService.create] 开始创建物品 - 用户ID: ${userId}`, { createItemDto });
    
    try {
      const { tagIds, purchaseDate, ...itemData } = createItemDto;

      // 处理购买日期
      const processedPurchaseDate = purchaseDate ? new Date(purchaseDate) : null;

      // 验证日期是否有效
      if (purchaseDate && isNaN(processedPurchaseDate?.getTime())) {
        console.error(`❌ [ItemsService.create] 无效的购买日期格式: ${purchaseDate}`);
        throw new Error(`无效的购买日期格式: ${purchaseDate}`);
      }

      // 如果有分类ID，验证分类是否存在
      if (itemData.categoryId) {
        console.log(`🔍 [ItemsService.create] 验证分类ID: ${itemData.categoryId}`);
        const categoryExists = await this.prisma.category.findUnique({
          where: { id: itemData.categoryId },
        });
        if (!categoryExists) {
          console.error(`❌ [ItemsService.create] 分类不存在 - ID: ${itemData.categoryId}`);
          throw new NotFoundException(`分类 ID ${itemData.categoryId} 不存在`);
        }
        console.log(`✅ [ItemsService.create] 分类验证通过 - ID: ${itemData.categoryId}`);
      }

      // 如果有标签ID，验证标签是否存在
      if (tagIds && tagIds.length > 0) {
        console.log(`🔍 [ItemsService.create] 验证标签IDs: ${tagIds.join(', ')}`);
        const existingTags = await this.prisma.tag.findMany({
          where: { id: { in: tagIds } },
        });
        if (existingTags.length !== tagIds.length) {
          const existingTagIds = existingTags.map(tag => tag.id);
          const missingTagIds = tagIds.filter(id => !existingTagIds.includes(id));
          console.error(`❌ [ItemsService.create] 标签不存在 - IDs: ${missingTagIds.join(', ')}`);
          throw new NotFoundException(`标签 ID ${missingTagIds.join(', ')} 不存在`);
        }
        console.log(`✅ [ItemsService.create] 标签验证通过 - IDs: ${tagIds.join(', ')}`);
      }

      console.log(`💾 [ItemsService.create] 开始创建物品到数据库`);
      const item = await this.prisma.item.create({
        data: {
          ...itemData,
          purchaseDate: processedPurchaseDate,
          userId,
          tags: tagIds && tagIds.length > 0
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

      console.log(`✅ [ItemsService.create] 物品创建成功 - ID: ${item.id}, 名称: ${item.name}`);
      return item;
    } catch (error) {
      console.error('❌ [ItemsService.create] 创建物品时发生错误:', error);
      throw error;
    }
  }

  async findAll(userId: number = 1, categoryId?: number, search?: string) {
    console.log(`🔍 [ItemsService.findAll] 查询物品列表 - 用户ID: ${userId}`, { categoryId, search });
    
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

    const items = await this.prisma.item.findMany({
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

    console.log(`✅ [ItemsService.findAll] 查询完成 - 找到 ${items.length} 个物品`);
    return items;
  }

  async findOne(id: number, userId: number = 1) {
    console.log(`🔍 [ItemsService.findOne] 查询单个物品 - ID: ${id}, 用户ID: ${userId}`);
    
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
      console.error(`❌ [ItemsService.findOne] 物品不存在 - ID: ${id}`);
      throw new NotFoundException(`物品 ID ${id} 不存在`);
    }

    console.log(`✅ [ItemsService.findOne] 物品查询成功 - ID: ${id}, 名称: ${item.name}`);
    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto, userId: number = 1) {
    console.log(`📝 [ItemsService.update] 开始更新物品 - ID: ${id}, 用户ID: ${userId}`, { updateItemDto });
    
    const { tagIds, purchaseDate, ...itemData } = updateItemDto;

    // 检查物品是否存在
    await this.findOne(id, userId);

    // 处理购买日期
    const processedPurchaseDate = purchaseDate ? new Date(purchaseDate) : undefined;

    // 如果有标签更新，先删除旧的关联
    if (tagIds !== undefined) {
      console.log(`🔄 [ItemsService.update] 更新物品标签 - 物品ID: ${id}`);
      await this.prisma.itemTag.deleteMany({
        where: { itemId: id },
      });
    }

    console.log(`💾 [ItemsService.update] 开始更新物品到数据库 - ID: ${id}`);
    const item = await this.prisma.item.update({
      where: { id },
      data: {
        ...itemData,
        ...(processedPurchaseDate !== undefined && { purchaseDate: processedPurchaseDate }),
        tags: tagIds && tagIds.length > 0
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

    console.log(`✅ [ItemsService.update] 物品更新成功 - ID: ${id}, 名称: ${item.name}`);
    return item;
  }

  async remove(id: number, userId: number = 1) {
    console.log(`🗑️ [ItemsService.remove] 开始删除物品 - ID: ${id}, 用户ID: ${userId}`);
    
    // 检查物品是否存在
    await this.findOne(id, userId);

    const result = await this.prisma.item.delete({
      where: { id },
    });

    console.log(`✅ [ItemsService.remove] 物品删除成功 - ID: ${id}`);
    return result;
  }

  async getStats(userId: number = 1) {
    console.log(`📊 [ItemsService.getStats] 获取统计信息 - 用户ID: ${userId}`);
    
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

    const stats = {
      totalItems,
      totalValue: totalValue._sum.price || 0,
      categoryStats: categoryStats.map((cat) => ({
        id: cat.id,
        name: cat.name,
        count: cat._count.items,
      })),
    };

    console.log(`✅ [ItemsService.getStats] 统计信息获取成功`, stats);
    return stats;
  }
} 