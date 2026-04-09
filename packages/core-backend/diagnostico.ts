
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const providerId = 'fa9c487f-ddb2-4951-a316-0eec4552cab4';
  const provider = await prisma.prov_Provider.findUnique({
    where: { id: providerId },
    include: { invoices: true, payments: true }
  });

  console.log('Provider:', provider?.businessName);
  console.log('Invoices count:', provider?.invoices.length);
  if (provider?.invoices) {
    provider.invoices.forEach(inv => {
      console.log(`Invoice: ${inv.invoiceNumber}, Status: ${inv.status}, Type: ${inv.invoiceType}, Total: ${inv.totalAmount}, isCtaCte: ${inv.isCtaCte}`);
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
