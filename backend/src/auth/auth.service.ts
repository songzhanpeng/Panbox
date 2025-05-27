import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    console.log(`🔐 [AuthService.validateUser] 验证用户 - 用户名: ${username}`);
    
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      console.log(`✅ [AuthService.validateUser] 用户验证成功 - 用户名: ${username}, ID: ${user.id}`);
      const { password: _, ...result } = user;
      return result;
    }
    
    console.warn(`❌ [AuthService.validateUser] 用户验证失败 - 用户名: ${username}`);
    return null;
  }

  async login(loginDto: LoginDto) {
    console.log(`🚪 [AuthService.login] 用户登录请求 - 用户名: ${loginDto.username}`);
    
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      console.error(`❌ [AuthService.login] 登录失败 - 用户名或密码错误: ${loginDto.username}`);
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!user.isActive) {
      console.error(`❌ [AuthService.login] 登录失败 - 账户已被禁用: ${loginDto.username}`);
      throw new UnauthorizedException('账户已被禁用');
    }

    console.log(`🔄 [AuthService.login] 更新最后登录时间 - 用户ID: ${user.id}`);
    // 更新最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    console.log(`🎫 [AuthService.login] 生成JWT令牌 - 用户ID: ${user.id}`);
    const payload = { username: user.username, sub: user.id, role: user.role };
    const result = {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };

    console.log(`✅ [AuthService.login] 登录成功 - 用户: ${user.username}, 角色: ${user.role}`);
    return result;
  }

  async register(registerDto: RegisterDto) {
    console.log(`📝 [AuthService.register] 用户注册请求 - 用户名: ${registerDto.username}, 邮箱: ${registerDto.email}`);
    
    // 检查用户名是否已存在
    console.log(`🔍 [AuthService.register] 检查用户名是否存在 - ${registerDto.username}`);
    const existingUser = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });

    if (existingUser) {
      console.error(`❌ [AuthService.register] 注册失败 - 用户名已存在: ${registerDto.username}`);
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    if (registerDto.email) {
      console.log(`🔍 [AuthService.register] 检查邮箱是否存在 - ${registerDto.email}`);
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingEmail) {
        console.error(`❌ [AuthService.register] 注册失败 - 邮箱已存在: ${registerDto.email}`);
        throw new ConflictException('邮箱已存在');
      }
    }

    console.log(`🔒 [AuthService.register] 加密用户密码`);
    // 加密密码
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    console.log(`💾 [AuthService.register] 创建新用户到数据库`);
    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    const { password: _, ...result } = user;
    console.log(`✅ [AuthService.register] 用户注册成功 - 用户名: ${user.username}, ID: ${user.id}`);
    return result;
  }

  async findUserById(id: number) {
    console.log(`🔍 [AuthService.findUserById] 查询用户信息 - ID: ${id}`);
    
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user) {
      console.log(`✅ [AuthService.findUserById] 用户查询成功 - 用户名: ${user.username}, ID: ${id}`);
    } else {
      console.warn(`❌ [AuthService.findUserById] 用户不存在 - ID: ${id}`);
    }

    return user;
  }
} 