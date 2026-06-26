const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findFirst().then(user => console.log(user.id)).finally(() => prisma.$disconnect());
