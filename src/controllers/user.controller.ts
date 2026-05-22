import { Request, Response } from 'express';
import { UserService } from '@/services/user.service';
import { ApiResponse } from '@/utils/api-response';

export class UserController {
  /**
   * Get all users
   */
  public static getUsers = async (req: Request, res: Response): Promise<void> => {
    const users = await UserService.getUsers();
    ApiResponse.success(res, 'Users retrieved successfully', { users }, 200);
  };

  /**
   * Get user by ID
   */
  public static getUserById = async (req: Request, res: Response): Promise<void> => {
    const user = await UserService.getUserById(req.params.id as string);
    ApiResponse.success(res, 'User retrieved successfully', { user }, 200);
  };

  /**
   * Update user details
   */
  public static updateUser = async (req: Request, res: Response): Promise<void> => {
    const updatedUser = await UserService.updateUser(req.params.id as string, req.body);
    ApiResponse.success(res, 'User updated successfully', { user: updatedUser }, 200);
  };

  /**
   * Delete user
   */
  public static deleteUser = async (req: Request, res: Response): Promise<void> => {
    await UserService.deleteUser(req.params.id as string);
    ApiResponse.success(res, 'User deleted successfully', null, 200);
  };
}
