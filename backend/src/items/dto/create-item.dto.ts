import { IsString, IsOptional, IsNumber, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({ description: '物品名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '物品描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '价格' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: '购买日期' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: '购买来源' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: '品牌' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: '型号' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: '物品状态' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({ description: '存放位置' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ description: '标签ID数组' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds?: number[];

  @ApiPropertyOptional({ description: '图片URL数组' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
} 