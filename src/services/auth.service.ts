import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { env } from '@/config/env';
import { AppError } from '@/utils/app-error';
import { RegisterInput, LoginInput, AuthResponse } from '@/types/auth.type';
import { SafeUser } from '@/types';

export class AuthService {
  /**
   * Registers a new user
   */
  public static async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, password, name, role } = input;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Alamat email sudah digunakan', 400);
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        ...(role && { role }),
      },
    });

    // 4. Generate JWT
    const token = this.generateToken(user.id);

    // 5. Return sanitized user and token
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  /**
   * Authenticates a user with email and password
   */
  public static async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Email atau password salah', 401);
    }

    // 2. Check password match
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new AppError('Email atau password salah', 401);
    }

    // 3. Generate JWT
    const token = this.generateToken(user.id);

    // 4. Return sanitized user and token
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  /**
   * Helper to generate JWT Token
   */
  private static generateToken(id: string): string {
    return jwt.sign({ id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }
}
