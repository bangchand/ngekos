import { Request, Response } from 'express';
import { UserService } from '@/services/user.service';
import { ApiResponse } from '@/utils/api-response';
import { PrismaQueryBuilder } from 'prisma-query-parser';

export class UserController {
  /**
   * Get all users
   */
  public static getUsers = async (req: Request, res: Response): Promise<void> => {
    const builder = new PrismaQueryBuilder(req.query);
    const queryOptions = builder.build();
    const { data, total } = await UserService.getUsers(queryOptions);
    ApiResponse.success(res, 'Berhasil mengambil daftar pengguna', data, 200, builder.getMeta(total, data.length));
  };

  /**
   * Get user by ID
   */
  public static getUserById = async (req: Request, res: Response): Promise<void> => {
    const user = await UserService.getUserById(req.params.id as string);
    ApiResponse.success(res, 'Berhasil mengambil data pengguna', { user }, 200);
  };

  /**
   * Update user details
   */
  public static updateUser = async (req: Request, res: Response): Promise<void> => {
    const updatedUser = await UserService.updateUser(req.params.id as string, req.body);
    ApiResponse.success(res, 'Berhasil memperbarui profil pengguna', { user: updatedUser }, 200);
  };

  /**
   * Delete user
   */
  public static deleteUser = async (req: Request, res: Response): Promise<void> => {
    await UserService.deleteUser(req.params.id as string);
    ApiResponse.success(res, 'Berhasil menghapus pengguna', null, 200);
  };
}
