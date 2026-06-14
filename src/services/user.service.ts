import bcrypt from 'bcryptjs';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/app-error';
import { UpdateUserInput, UserWithoutPassword } from '@/types/user.type';

export class UserService {
  /**
   * Retrieves all users (sanitized)
   */
  public static async getUsers(queryOptions: any = {}): Promise<{ data: UserWithoutPassword[], total: number }> {
    if (!queryOptions.include) {
      queryOptions.select = {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ...queryOptions.select,
      };
    }
    const data = await prisma.user.findMany(queryOptions);
    const total = await prisma.user.count({ where: queryOptions.where });
    return { data, total };
  }

  /**
   * Retrieves a single user by ID (sanitized)
   */
  public static async getUserById(id: string): Promise<UserWithoutPassword> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    return user;
  }

  /**
   * Updates an existing user's details
   */
  public static async updateUser(
    id: string,
    input: UpdateUserInput
  ): Promise<UserWithoutPassword> {
    // 1. Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const updateData: Partial<typeof user> = {};

    // 2. Map input data to database fields
    if (input.email) {
      // Check if email already in use
      const emailInUse = await prisma.user.findFirst({
        where: {
          email: input.email,
          NOT: { id },
        },
      });
      if (emailInUse) {
        throw new AppError('Email sudah digunakan oleh pengguna lain', 400);
      }
      updateData.email = input.email;
    }

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(input.password, salt);
    }

    // 3. Update database record
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Deletes a user by ID
   */
  public static async deleteUser(id: string): Promise<void> {
    // 1. Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    // 2. Delete user
    await prisma.user.delete({
      where: { id },
    });
  }
}
