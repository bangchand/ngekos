import { Response } from 'express';

export class ApiResponse<T = any> {
  public readonly status: number;
  public readonly message: string;
  public readonly data?: T | null;

  constructor(status: number, message: string, data: T | null = null) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  public static success<T>(res: Response, message: string, data: T | null = null, statusCode: number = 200) {
    return res.status(statusCode).json(new ApiResponse<T>(statusCode, message, data));
  }

  public static error(res: Response, message: string, data: any = null, statusCode: number = 500) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
  }

  public static fail(res: Response, message: string, data: any = null, statusCode: number = 400) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
  }
}
