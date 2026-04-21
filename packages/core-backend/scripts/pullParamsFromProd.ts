import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('☁️ Conectando a Producción (Neon) para extraer parámetros...');
  
  const remotePrisma = new PrismaClient({
    datasourceUrl: 'postgresql://neondb_owner:npg_Ox5QVg7fGaMw@ep-damp-flower-acp8tdbb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  });

  const localPrisma = new PrismaClient();

  try {
    const parameters = await remotePrisma.core_Parameter.findMany();
    console.log(`📦 Se encontraron ${parameters.length} parámetros en producción.`);

    console.log('📥 Insertando en base de datos local...');
    let count = 0;
    for (const param of parameters) {
      await localPrisma.core_Parameter.upsert({
        where: { category_key: { category: param.category, key: param.key || '' } },
        update: { value: param.value, label: param.label, isActive: param.isActive },
        create: { category: param.category, key: param.key || '', value: param.value, label: param.label, isActive: param.isActive }
      });
      count++;
    }

    console.log(`✅ ¡Éxito! Se sincronizaron ${count} parámetros en total.`);
  } catch (error) {
    console.error('❌ Error al sincronizar:', error);
  } finally {
    await remotePrisma.$disconnect();
    await localPrisma.$disconnect();
  }
}

main();
