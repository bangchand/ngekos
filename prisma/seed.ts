import { PrismaClient } from '@prisma/client';
import { seedFacilities } from './seeds/facilities.seed';
import { seedUsers } from './seeds/users.seed';
import { seedKosts } from './seeds/kosts.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('[START] Starting modular database seeding...');

  // Pastikan urutannya benar (Facility & User dibuat dulu sebelum Kost yang butuh foreign key)
  await seedFacilities(prisma);
  await seedUsers(prisma);
  await seedKosts(prisma);

  console.log('[SUCCESS] Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('[ERROR] Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
