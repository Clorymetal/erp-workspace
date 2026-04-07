const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://neondb_owner:npg_Ox5QVg7fGaMw@ep-damp-flower-acp8tdbb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  try {
    console.log('Inserting POSNET provider (missing record)...');
    await prisma.$executeRaw`INSERT INTO public."Prov_Provider" VALUES ('70ce740a-f4ef-4b76-991e-91866fd75e5f', 'POSNET SOCIEDAD DE RESONSABILIDAD LIMITADA', '30620177497', 'PERU 143 PISO;2 B°MONSERRAT', 0, NULL, '2026-03-20 20:39:09.23'::timestamp, '2026-03-20 21:07:14.57'::timestamp, '1067', 'Bs. As.', 'RI', true);`;
    console.log('✅ Done.');
    process.exit(0);
  } catch (e) {
    if (e.meta && e.meta.code === '23505') {
        console.log('Already exists.');
        process.exit(0);
    }
    console.error('❌ Failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
