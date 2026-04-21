
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const providers = await prisma.prov_Provider.findMany({ take: 1 });
    console.log('Result:', JSON.stringify(providers, null, 2));
    
    // Check table structure via raw query
    const tableInfo = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Prov_Provider' AND column_name = 'fantasyName'`;
    console.log('Column Info:', tableInfo);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
