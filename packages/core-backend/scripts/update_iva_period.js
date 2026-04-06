const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Forzar TODAS las facturas a período marzo 2026
  const result = await prisma.prov_Invoice.updateMany({
    data: { ivaPeriod: '2026-03' }
  });
  
  console.log(`Se asignaron ${result.count} facturas al período 2026-03 (Marzo).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
