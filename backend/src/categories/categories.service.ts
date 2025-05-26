import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ResponseUtil } from '../common/utils/response.util';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.prisma.category.create({
        data: createCategoryDto,
      });
      return ResponseUtil.created(category, '分类创建成功');
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('分类名称已存在');
      }
      throw error;
    }
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
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
    });
    return ResponseUtil.success(categories, '获取分类列表成功');
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`分类 ID ${id} 不存在`);
    }

    return ResponseUtil.success(category, '获取分类详情成功');
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // 检查分类是否存在
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException(`分类 ID ${id} 不存在`);
    }

    try {
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
      return ResponseUtil.updated(updatedCategory, '分类更新成功');
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('分类名称已存在');
      }
      throw error;
    }
  }

  async remove(id: number) {
    // 检查分类是否存在
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException(`分类 ID ${id} 不存在`);
    }

    // 检查是否有物品使用此分类
    const itemCount = await this.prisma.item.count({
      where: { categoryId: id },
    });

    if (itemCount > 0) {
      throw new ConflictException(`无法删除分类，还有 ${itemCount} 个物品使用此分类`);
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return ResponseUtil.deleted('分类删除成功');
  }
} 