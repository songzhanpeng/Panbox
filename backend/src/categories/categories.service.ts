import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ResponseUtil } from '../common/utils/response.util';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    console.log(`📝 [CategoriesService.create] 开始创建分类`, { createCategoryDto });
    
    try {
      const category = await this.prisma.category.create({
        data: createCategoryDto,
      });
      
      console.log(`✅ [CategoriesService.create] 分类创建成功 - ID: ${category.id}, 名称: ${category.name}`);
      return ResponseUtil.created(category, '分类创建成功');
    } catch (error) {
      if (error.code === 'P2002') {
        console.error(`❌ [CategoriesService.create] 分类创建失败 - 名称已存在: ${createCategoryDto.name}`);
        throw new ConflictException('分类名称已存在');
      }
      console.error(`❌ [CategoriesService.create] 分类创建失败:`, error);
      throw error;
    }
  }

  async findAll() {
    console.log(`🔍 [CategoriesService.findAll] 查询所有分类`);
    
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
    
    console.log(`✅ [CategoriesService.findAll] 查询完成 - 找到 ${categories.length} 个分类`);
    return ResponseUtil.success(categories, '获取分类列表成功');
  }

  async findOne(id: number) {
    console.log(`🔍 [CategoriesService.findOne] 查询单个分类 - ID: ${id}`);
    
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
      console.error(`❌ [CategoriesService.findOne] 分类不存在 - ID: ${id}`);
      throw new NotFoundException(`分类 ID ${id} 不存在`);
    }

    console.log(`✅ [CategoriesService.findOne] 分类查询成功 - ID: ${id}, 名称: ${category.name}`);
    return ResponseUtil.success(category, '获取分类详情成功');
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    console.log(`📝 [CategoriesService.update] 开始更新分类 - ID: ${id}`, { updateCategoryDto });
    
    // 检查分类是否存在
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      console.error(`❌ [CategoriesService.update] 分类不存在 - ID: ${id}`);
      throw new NotFoundException(`分类 ID ${id} 不存在`);
    }

    try {
      console.log(`💾 [CategoriesService.update] 开始更新分类到数据库 - ID: ${id}`);
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
      
      console.log(`✅ [CategoriesService.update] 分类更新成功 - ID: ${id}, 名称: ${updatedCategory.name}`);
      return ResponseUtil.updated(updatedCategory, '分类更新成功');
    } catch (error) {
      if (error.code === 'P2002') {
        console.error(`❌ [CategoriesService.update] 分类更新失败 - 名称已存在: ${updateCategoryDto.name}`);
        throw new ConflictException('分类名称已存在');
      }
      console.error(`❌ [CategoriesService.update] 分类更新失败:`, error);
      throw error;
    }
  }

  async remove(id: number) {
    console.log(`🗑️ [CategoriesService.remove] 开始删除分类 - ID: ${id}`);
    
    // 检查分类是否存在
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      console.error(`❌ [CategoriesService.remove] 分类不存在 - ID: ${id}`);
      throw new NotFoundException(`分类 ID ${id} 不存在`);
    }

    // 检查是否有物品使用此分类
    console.log(`🔍 [CategoriesService.remove] 检查分类使用情况 - ID: ${id}`);
    const itemCount = await this.prisma.item.count({
      where: { categoryId: id },
    });

    if (itemCount > 0) {
      console.error(`❌ [CategoriesService.remove] 分类删除失败 - 还有 ${itemCount} 个物品使用此分类`);
      throw new ConflictException(`无法删除分类，还有 ${itemCount} 个物品使用此分类`);
    }

    console.log(`💾 [CategoriesService.remove] 开始删除分类 - ID: ${id}`);
    await this.prisma.category.delete({
      where: { id },
    });

    console.log(`✅ [CategoriesService.remove] 分类删除成功 - ID: ${id}`);
    return ResponseUtil.deleted('分类删除成功');
  }
} 