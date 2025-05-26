import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: '创建物品' })
  @ApiResponse({ status: 201, description: '物品创建成功' })
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Get()
  @ApiOperation({ summary: '获取物品列表' })
  @ApiQuery({ name: 'categoryId', required: false, description: '分类ID' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiResponse({ status: 200, description: '获取物品列表成功' })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    const categoryIdNum = categoryId ? parseInt(categoryId) : undefined;
    return this.itemsService.findAll(1, categoryIdNum, search);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取统计信息' })
  @ApiResponse({ status: 200, description: '获取统计信息成功' })
  getStats() {
    return this.itemsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个物品详情' })
  @ApiResponse({ status: 200, description: '获取物品详情成功' })
  @ApiResponse({ status: 404, description: '物品不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新物品' })
  @ApiResponse({ status: 200, description: '物品更新成功' })
  @ApiResponse({ status: 404, description: '物品不存在' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemsService.update(id, updateItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除物品' })
  @ApiResponse({ status: 200, description: '物品删除成功' })
  @ApiResponse({ status: 404, description: '物品不存在' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.remove(id);
  }
} 