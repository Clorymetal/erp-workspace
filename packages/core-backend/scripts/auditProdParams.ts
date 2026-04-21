import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('☁️ Auditoría de Categorías en Producción (Neon)...');
  const remotePrisma = new PrismaClient({
    datasourceUrl: 'postgresql://neondb_owner:npg_Ox5QVg7fGaMw@ep-damp-flower-acp8tdbb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  });

  try {
    const categories = await remotePrisma.core_Parameter.groupBy({
      by: ['category'],
      _count: { id: true }
    });
    console.log('Categorías encontradas en Producción:', categories);

    const samples = await remotePrisma.core_Parameter.findMany({
      where: { NOT: { category: { in: ['PROVINCIA', 'COND_FISCAL', 'FACTO_TYPE'] } } },
      take: 20
    });
    console.log('Muestra de otros parámetros:', samples);

  } catch (error) {
    console.error(error);
  } finally {
    await remotePrisma.$disconnect();
  }
}

main();
