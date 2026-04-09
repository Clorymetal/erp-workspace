
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pid = 'fa9c487f-ddb2-4951-a316-0eec4552cab4';
  
  const provider = await prisma.prov_Provider.findUnique({
    where: { id: pid },
    include: { invoices: true }
  });

  if (!provider) {
    console.log("PROVIDER NOT FOUND IN DATABASE:", pid);
    return;
  }

  console.log("PROVIDER FOUND:", provider.businessName);
  console.log("INVOICES COUNT:", provider.invoices.length);
  
  provider.invoices.forEach(inv => {
    console.log(`Invoice: ID=${inv.id}, Num=${inv.invoiceNumber}, Status=${inv.status}, type=${inv.invoiceType}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
