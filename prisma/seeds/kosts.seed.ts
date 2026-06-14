import { PrismaClient } from '@prisma/client';

export const seedKosts = async (prisma: PrismaClient) => {
  // Kita clean kosts table dulu sebelum seed ulang kalau mau agar tak berlipat ganda
  await prisma.kost.deleteMany();

  // Ambil data dari tabel lain
  const owner1 = await prisma.user.findUnique({ where: { email: 'owner@example.com' } });
  const owner2 = await prisma.user.findUnique({ where: { email: 'juragan@example.com' } });
  
  const wifi = await prisma.facility.findUnique({ where: { name: 'WiFi' } });
  const ac = await prisma.facility.findUnique({ where: { name: 'AC' } });
  const bathroom = await prisma.facility.findUnique({ where: { name: 'Kamar Mandi Dalam' } });
  const parkir = await prisma.facility.findUnique({ where: { name: 'Parkir Motor' } });
  const cctv = await prisma.facility.findUnique({ where: { name: 'CCTV 24 Jam' } });
  
  if (!owner1 || !owner2 || !wifi || !ac || !bathroom || !parkir || !cctv) {
    console.log('[ERROR] Kosts seed failed: Missing required relations');
    return;
  }

  const kosts = [
    {
      ownerId: owner1.id,
      name: 'Kost Bintang Lima',
      description: 'Kost eksklusif fasilitas lengkap',
      price: 1500000,
      type: 'MIXED' as const,
      address: 'Jl. Melati No 1',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      status: 'ACTIVE' as const,
      facilities: [{ id: wifi.id }, { id: ac.id }, { id: bathroom.id }, { id: parkir.id }, { id: cctv.id }],
    },
    {
      ownerId: owner1.id,
      name: 'Kost Mawar Indah',
      description: 'Kost khusus putri dekat kampus',
      price: 800000,
      type: 'FEMALE' as const,
      address: 'Jl. Mawar No 2',
      city: 'Bandung',
      province: 'Jawa Barat',
      status: 'ACTIVE' as const,
      facilities: [{ id: wifi.id }, { id: parkir.id }],
    },
    {
      ownerId: owner2.id,
      name: 'Kost Sultan BSD',
      description: 'Kost mewah tipe studio',
      price: 3500000,
      type: 'MIXED' as const,
      address: 'BSD City',
      city: 'Tangerang Selatan',
      province: 'Banten',
      status: 'ACTIVE' as const,
      facilities: [{ id: wifi.id }, { id: ac.id }, { id: bathroom.id }, { id: cctv.id }],
    },
    {
      ownerId: owner2.id,
      name: 'Kost Putra Mandiri',
      description: 'Kost putra harga mahasiswa',
      price: 600000,
      type: 'MALE' as const,
      address: 'Jl. Sudirman No 4',
      city: 'Yogyakarta',
      province: 'DIY',
      status: 'ACTIVE' as const,
      facilities: [{ id: parkir.id }],
    }
  ];

  for (const kost of kosts) {
    await prisma.kost.create({
      data: {
        ownerId: kost.ownerId,
        name: kost.name,
        description: kost.description,
        type: kost.type,
        address: kost.address,
        city: kost.city,
        province: kost.province,
        status: kost.status,
      }
    });
  }

  console.log('[SUCCESS] Kosts seeded successfully');
};
