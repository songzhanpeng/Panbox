import { ApiResponse, PaginatedResponse } from '../interfaces/response.interface';
import { RESPONSE_CODES, RESPONSE_MESSAGES } from '../constants/response-codes';

export class ResponseUtil {
  /**
   * 成功响应
   */
  static success<T>(data?: T, message: string = RESPONSE_MESSAGES.SUCCESS): ApiResponse<T> {
    return {
      code: RESPONSE_CODES.SUCCESS,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 创建成功响应
   */
  static created<T>(data?: T, message: string = RESPONSE_MESSAGES.CREATED): ApiResponse<T> {
    return {
      code: RESPONSE_CODES.CREATED,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 更新成功响应
   */
  static updated<T>(data?: T, message: string = RESPONSE_MESSAGES.UPDATED): ApiResponse<T> {
    return {
      code: RESPONSE_CODES.SUCCESS,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 删除成功响应
   */
  static deleted(message: string = RESPONSE_MESSAGES.DELETED): ApiResponse<null> {
    return {
      code: RESPONSE_CODES.SUCCESS,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 分页响应
   */
  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = RESPONSE_MESSAGES.SUCCESS
  ): PaginatedResponse<T> {
    return {
      code: RESPONSE_CODES.SUCCESS,
      message,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 错误响应
   */
  static error(code: number, message: string): ApiResponse<null> {
    return {
      code,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
} 