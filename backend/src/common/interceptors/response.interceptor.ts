import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/response.interface';
import { ResponseUtil } from '../utils/response.util';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();
    
    return next.handle().pipe(
      map((data) => {
        // 如果数据已经是标准格式，直接返回
        if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
          return data;
        }

        // 根据HTTP状态码决定响应格式
        const statusCode = response.statusCode;
        
        if (statusCode === 201) {
          return ResponseUtil.created(data);
        } else if (statusCode >= 200 && statusCode < 300) {
          return ResponseUtil.success(data);
        } else {
          return ResponseUtil.error(statusCode, '请求失败');
        }
      }),
    );
  }
} 