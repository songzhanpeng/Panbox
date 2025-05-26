import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ResponseUtil } from '../common/utils/response.util';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto) {
    try {
      const tag = await this.prisma.tag.create({
        data: createTagDto,
      });
      return ResponseUtil.created(tag, '标签创建成功');
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('标签名称已存在');
      }
      throw error;
    }
  }

  async findAll() {
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
    return ResponseUtil.success(tags, '获取标签列表成功');
  }

  async findOne(id: number) {
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
      throw new NotFoundException(`标签 ID ${id} 不存在`);
    }

    return ResponseUtil.success(tag, '获取标签详情成功');
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    // 检查标签是否存在
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new NotFoundException(`标签 ID ${id} 不存在`);
    }

    try {
      const updatedTag = await this.prisma.tag.update({
        where: { id },
        data: updateTagDto,
      });
      return ResponseUtil.updated(updatedTag, '标签更新成功');
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('标签名称已存在');
      }
      throw error;
    }
  }

  async remove(id: number) {
    // 检查标签是否存在
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new NotFoundException(`标签 ID ${id} 不存在`);
    }

    // 检查是否有物品使用此标签
    const itemCount = await this.prisma.itemTag.count({
      where: { tagId: id },
    });

    if (itemCount > 0) {
      throw new ConflictException(`无法删除标签，还有 ${itemCount} 个物品使用此标签`);
    }

    await this.prisma.tag.delete({
      where: { id },
    });

    return ResponseUtil.deleted('标签删除成功');
  }
} 