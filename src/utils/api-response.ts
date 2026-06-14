import { Response } from 'express';

export class ApiResponse<T = any> {
  public readonly status: number;
  public readonly message: string;
  public readonly data?: T | null;
  public readonly meta?: any;

  constructor(status: number, message: string, data: T | null = null, meta?: any) {
    this.status = status;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  public static success<T>(res: Response, message: string, data: T | null = null, statusCode: number = 200, meta?: any) {
    return res.status(statusCode).json(new ApiResponse<T>(statusCode, message, data, meta));
  }

  public static error(res: Response, message: string, data: any = null, statusCode: number = 500) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
  }

  public static fail(res: Response, message: string, data: any = null, statusCode: number = 400) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
  }
}
