import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ResponseUtil } from '../common/utils/response.util';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto) {
    console.log(`🏷️ [TagsService.create] 开始创建标签`, { createTagDto });
    
    try {
      const tag = await this.prisma.tag.create({
        data: createTagDto,
      });
      
      console.log(`✅ [TagsService.create] 标签创建成功 - ID: ${tag.id}, 名称: ${tag.name}`);
      return ResponseUtil.created(tag, '标签创建成功');
    } catch (error) {
      if (error.code === 'P2002') {
        console.error(`❌ [TagsService.create] 标签创建失败 - 名称已存在: ${createTagDto.name}`);
        throw new ConflictException('标签名称已存在');
      }
      console.error(`❌ [TagsService.create] 标签创建失败:`, error);
      throw error;
    }
  }

  async findAll() {
    console.log(`🔍 [TagsService.findAll] 查询所有标签`);
    
    const tags = await this.prisma.tag.findMany({
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
    
    console.log(`✅ [TagsService.findAll] 查询完成 - 找到 ${tags.length} 个标签`);
    return ResponseUtil.success(tags, '获取标签列表成功');
  }

  async findOne(id: number) {
    console.log(`🔍 [TagsService.findOne] 查询单个标签 - ID: ${id}`);
    
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!tag) {
      console.error(`❌ [TagsService.findOne] 标签不存在 - ID: ${id}`);
      throw new NotFoundException(`标签 ID ${id} 不存在`);
    }

    console.log(`✅ [TagsService.findOne] 标签查询成功 - ID: ${id}, 名称: ${tag.name}`);
    return ResponseUtil.success(tag, '获取标签详情成功');
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    console.log(`📝 [TagsService.update] 开始更新标签 - ID: ${id}`, { updateTagDto });
    
    // 检查标签是否存在
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      console.error(`❌ [TagsService.update] 标签不存在 - ID: ${id}`);
      throw new NotFoundException(`标签 ID ${id} 不存在`);
    }

    try {
      console.log(`💾 [TagsService.update] 开始更新标签到数据库 - ID: ${id}`);
      const updatedTag = await this.prisma.tag.update({
        where: { id },
        data: updateTagDto,
      });
      
      console.log(`✅ [TagsService.update] 标签更新成功 - ID: ${id}, 名称: ${updatedTag.name}`);
      return ResponseUtil.updated(updatedTag, '标签更新成功');
    } catch (error) {
      if (error.code === 'P2002') {
        console.error(`❌ [TagsService.update] 标签更新失败 - 名称已存在: ${updateTagDto.name}`);
        throw new ConflictException('标签名称已存在');
      }
      console.error(`❌ [TagsService.update] 标签更新失败:`, error);
      throw error;
    }
  }

  async remove(id: number) {
    console.log(`🗑️ [TagsService.remove] 开始删除标签 - ID: ${id}`);
    
    // 检查标签是否存在
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      console.error(`❌ [TagsService.remove] 标签不存在 - ID: ${id}`);
      throw new NotFoundException(`标签 ID ${id} 不存在`);
    }

    // 检查是否有物品使用此标签
    console.log(`🔍 [TagsService.remove] 检查标签使用情况 - ID: ${id}`);
    const itemCount = await this.prisma.itemTag.count({
      where: { tagId: id },
    });

    if (itemCount > 0) {
      console.error(`❌ [TagsService.remove] 标签删除失败 - 还有 ${itemCount} 个物品使用此标签`);
      throw new ConflictException(`无法删除标签，还有 ${itemCount} 个物品使用此标签`);
    }

    console.log(`💾 [TagsService.remove] 开始删除标签 - ID: ${id}`);
    await this.prisma.tag.delete({
      where: { id },
    });

    console.log(`✅ [TagsService.remove] 标签删除成功 - ID: ${id}`);
    return ResponseUtil.deleted('标签删除成功');
  }
} 