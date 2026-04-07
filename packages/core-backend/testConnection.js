const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://neondb_owner:npg_Ox5QVg7fGaMw@ep-damp-flower-acp8tdbb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  try {
    console.log('Testing connection to Neon...');
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ Connection successful:', result);
    process.exit(0);
  } catch (e) {
    console.error('❌ Connection failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
