import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const seedUsers = async (prisma: PrismaClient) => {
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = [
    {
      email: 'owner@example.com',
      name: 'Bapak Kost',
      password: hashedPassword,
      role: 'OWNER' as const,
    },
    {
      email: 'juragan@example.com',
      name: 'Ibu Kost Sultan',
      password: hashedPassword,
      role: 'OWNER' as const,
    },
    {
      email: 'admin@example.com',
      name: 'Admin Sistem',
      password: hashedPassword,
      role: 'ADMIN' as const,
    },
    {
      email: 'user1@example.com',
      name: 'Pencari Kost',
      password: hashedPassword,
      role: 'USER' as const,
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log('[SUCCESS] Users seeded successfully');
};
