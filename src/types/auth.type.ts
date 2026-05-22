import { User } from '@prisma/client';

export type RegisterInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type LoginInput = Pick<User, 'email' | 'password'>;

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}
