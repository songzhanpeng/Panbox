import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '分类描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '分类颜色' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: '分类图标' })
  @IsOptional()
  @IsString()
  icon?: string;
} 