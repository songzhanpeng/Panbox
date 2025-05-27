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
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('items')
@Controller('items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: '创建物品' })
  @ApiResponse({ status: 201, description: '物品创建成功' })
  create(@Body() createItemDto: CreateItemDto, @Request() req) {
    return this.itemsService.create(createItemDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取物品列表' })
  @ApiQuery({ name: 'categoryId', required: false, description: '分类ID' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiResponse({ status: 200, description: '获取物品列表成功' })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Request() req?,
  ) {
    const categoryIdNum = categoryId ? parseInt(categoryId) : undefined;
    return this.itemsService.findAll(req.user.id, categoryIdNum, search);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取统计信息' })
  @ApiResponse({ status: 200, description: '获取统计信息成功' })
  getStats(@Request() req) {
    return this.itemsService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个物品详情' })
  @ApiResponse({ status: 200, description: '获取物品详情成功' })
  @ApiResponse({ status: 404, description: '物品不存在' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.itemsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新物品' })
  @ApiResponse({ status: 200, description: '物品更新成功' })
  @ApiResponse({ status: 404, description: '物品不存在' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto,
    @Request() req,
  ) {
    return this.itemsService.update(id, updateItemDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除物品' })
  @ApiResponse({ status: 200, description: '物品删除成功' })
  @ApiResponse({ status: 404, description: '物品不存在' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.itemsService.remove(id, req.user.id);
  }
} 