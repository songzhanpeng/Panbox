import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ description: '标签名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '标签颜色' })
  @IsOptional()
  @IsString()
  color?: string;
} 