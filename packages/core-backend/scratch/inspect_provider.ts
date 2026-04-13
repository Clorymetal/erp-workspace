import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const taxId = '20257238807';
    const provider = await prisma.prov_Provider.findUnique({
        where: { taxId },
        include: {
            invoices: true,
            payments: true,
            contacts: true
        }
    });

    if (!provider) {
        console.log('Provider not found');
        return;
    }

    console.log('--- PROVIDER DATA ---');
    console.log(`ID: ${provider.id}`);
    console.log(`Name: ${provider.businessName}`);
    console.log(`Invoices count: ${provider.invoices.length}`);
    console.log(`Payments count: ${provider.payments.length}`);

    if (provider.invoices.length > 0) {
        console.log('Invoices IDs:', provider.invoices.map(i => i.id));
    }
    if (provider.payments.length > 0) {
        console.log('Payments IDs:', provider.payments.map(p => p.id));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
