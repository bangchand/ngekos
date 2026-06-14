import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { ApiResponse } from '@/utils/api-response';
import { env } from '@/config/env';

export class AuthController {
  /**
   * Register Controller
   */
  public static register = async (req: Request, res: Response): Promise<void> => {
    const result = await AuthService.register(req.body);

    // Set JWT token cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    ApiResponse.success(res, 'Registrasi pengguna berhasil', result, 201);
  };

  /**
   * Login Controller
   */
  public static login = async (req: Request, res: Response): Promise<void> => {
    const result = await AuthService.login(req.body);

    // Set JWT token cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    ApiResponse.success(res, 'Login berhasil', result, 200);
  };

  /**
   * Get Profile Controller
   */
  public static getProfile = async (req: Request, res: Response): Promise<void> => {
    // req.user is set by the protect middleware
    ApiResponse.success(res, 'Berhasil mengambil profil pengguna', { user: req.user }, 200);
  };
}
