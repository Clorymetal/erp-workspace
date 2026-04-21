import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.core_Parameter.groupBy({
    by: ['category'],
    _count: { id: true }
  });
  console.log('Categories found:', categories);

  const samples = await prisma.core_Parameter.findMany({
    take: 20
  });
  console.log('Sample parameters:', samples);
}

main();
