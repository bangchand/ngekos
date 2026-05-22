import { User } from '@prisma/client';

export interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
}

export type UserWithoutPassword = Omit<User, 'password'>;
