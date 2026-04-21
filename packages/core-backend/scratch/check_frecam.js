
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const frecam = await prisma.prov_Provider.findFirst({
      where: { businessName: { contains: 'FRECAM' } }
    });
    console.log('FRECAM:', JSON.stringify(frecam, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
