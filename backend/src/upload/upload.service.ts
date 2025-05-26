import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost:9000');
    const accessKey = this.configService.get('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get('MINIO_SECRET_KEY', 'minioadmin');
    this.bucketName = this.configService.get('MINIO_BUCKET', 'panbox-assets');

    // 解析 endpoint - 移除协议前缀
    let endPoint = endpoint;
    let useSSL = false;
    
    if (endpoint.startsWith('http://')) {
      endPoint = endpoint.replace('http://', '');
      useSSL = false;
    } else if (endpoint.startsWith('https://')) {
      endPoint = endpoint.replace('https://', '');
      useSSL = true;
    }

    // 解析主机和端口
    const [host, portStr] = endPoint.split(':');
    const port = portStr ? parseInt(portStr) : (useSSL ? 443 : 9000);

    console.log(`🔧 MinIO 配置: ${host}:${port}, SSL: ${useSSL}`);

    this.minioClient = new Minio.Client({
      endPoint: host,
      port: port,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
      region: 'us-east-1', // 明确指定区域
    });

    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      console.log(`🔍 检查 bucket '${this.bucketName}' 是否存在...`);
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      
      if (!bucketExists) {
        console.log(`📦 创建 bucket '${this.bucketName}'...`);
        // 尝试不指定区域创建 bucket
        await this.minioClient.makeBucket(this.bucketName, '');
        console.log(`✅ MinIO bucket '${this.bucketName}' 创建成功`);
      } else {
        console.log(`✅ MinIO bucket '${this.bucketName}' 已存在`);
      }

      // 设置 bucket 策略为公开读取（可选）
      await this.setBucketPolicy();
      
    } catch (error) {
      console.error('❌ MinIO bucket 初始化失败:', error);
      
      // 提供更详细的错误信息和解决方案
      if (error.code === 'ECONNREFUSED') {
        console.error('💡 请确保 MinIO 服务正在运行');
        console.error('   可以尝试: docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"');
      } else if (error.code === 'NotFound') {
        console.error('💡 可能的解决方案:');
        console.error('   1. 检查 MinIO 服务是否正确启动');
        console.error('   2. 检查访问密钥是否正确');
        console.error('   3. 尝试手动在 MinIO 控制台创建 bucket');
        
        // 尝试使用不同的方式创建 bucket
        try {
          console.log('🔄 尝试使用默认区域创建 bucket...');
          await this.minioClient.makeBucket(this.bucketName);
          console.log(`✅ MinIO bucket '${this.bucketName}' 创建成功（默认区域）`);
        } catch (retryError) {
          console.error('❌ 重试创建 bucket 也失败了:', retryError.message);
        }
      } else if (error.code === 'AccessDenied') {
        console.error('💡 访问被拒绝，请检查 MinIO 的访问密钥配置');
      } else {
        console.error('💡 未知错误，请检查 MinIO 服务状态和网络连接');
      }
    }
  }

  private async setBucketPolicy() {
    try {
      // 设置 bucket 为公开读取策略（可选）
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      console.log(`🔓 Bucket '${this.bucketName}' 策略设置为公开读取`);
    } catch (error) {
      // 策略设置失败不是致命错误，只记录警告
      console.warn('⚠️ 设置 bucket 策略失败（这不会影响基本功能）:', error.message);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('未提供文件');
    }

    // 验证文件类型
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('不支持的文件类型，仅支持图片文件');
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小不能超过 5MB');
    }

    try {
      // 生成唯一文件名
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const objectName = `images/${fileName}`;

      // 上传文件到 MinIO
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      // 返回文件访问 URL
      const fileUrl = await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        24 * 60 * 60, // 24小时有效期
      );

      return fileUrl;
    } catch (error) {
      console.error('文件上传失败:', error);
      throw new BadRequestException('文件上传失败');
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('未提供文件');
    }

    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // 从 URL 中提取对象名称
      const url = new URL(fileUrl);
      const objectName = url.pathname.substring(1); // 移除开头的 '/'

      await this.minioClient.removeObject(this.bucketName, objectName);
    } catch (error) {
      console.error('文件删除失败:', error);
      throw new BadRequestException('文件删除失败');
    }
  }
} 