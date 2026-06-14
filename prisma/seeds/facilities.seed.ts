import { PrismaClient } from '@prisma/client';

export const seedFacilities = async (prisma: PrismaClient) => {
  const facilities = [
    { name: 'WiFi', description: 'High-speed internet access' },
    { name: 'AC', description: 'Air conditioning' },
    { name: 'Kamar Mandi Dalam', description: 'Private bathroom' },
    { name: 'Kasur', description: 'Springbed 120x200' },
    { name: 'Lemari Pakaian', description: 'Lemari kayu 2 pintu' },
    { name: 'Meja Belajar', description: 'Meja dan kursi kerja' },
    { name: 'Dapur Bersama', description: 'Dapur lengkap dengan kompor' },
    { name: 'Kulkas Bersama', description: 'Kulkas di area umum' },
    { name: 'Parkir Motor', description: 'Area parkir luas' },
    { name: 'CCTV 24 Jam', description: 'Keamanan ekstra' }
  ];

  for (const facility of facilities) {
    await prisma.facility.upsert({
      where: { name: facility.name },
      update: {},
      create: facility,
    });
  }
  
  console.log('[SUCCESS] Facilities seeded successfully');
};
