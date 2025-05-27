import { 
  Controller, 
  Get, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  UseGuards, 
  Request,
  ParseIntPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('超级管理员')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats/users')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: '获取用户统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get('stats/system')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: '获取系统统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('users')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getUsers(pageNum, limitNum, search);
  }

  @Put('users/:id/status')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: '更新用户状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async updateUserStatus(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: { isActive: boolean },
    @Request() req,
  ) {
    return this.adminService.updateUserStatus(userId, body.isActive, req.user.id);
  }

  @Put('users/:id/role')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: '更新用户角色' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async updateUserRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: { role: string },
    @Request() req,
  ) {
    return this.adminService.updateUserRole(userId, body.role, req.user.id);
  }

  @Delete('users/:id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async deleteUser(
    @Param('id', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    return this.adminService.deleteUser(userId, req.user.id);
  }
} 