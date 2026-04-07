const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://neondb_owner:npg_Ox5QVg7fGaMw@ep-damp-flower-acp8tdbb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  try {
    const providers = await prisma.prov_Provider.count();
    const invoices = await prisma.prov_Invoice.count();
    const employees = await prisma.emp_Employee.count();
    const parameters = await prisma.core_Parameter.count();
    const advances = await prisma.emp_Advance.count();
    const salaryPeriods = await prisma.emp_SalaryPeriod.count();

    console.log(`Counts on Neon Database:`);
    console.log(`  - Providers: ${providers}`);
    console.log(`  - Invoices: ${invoices}`);
    console.log(`  - Employees: ${employees}`);
    console.log(`  - Parameters: ${parameters}`);
    console.log(`  - Advances: ${advances}`);
    console.log(`  - Salary Periods: ${salaryPeriods}`);
    process.exit(0);
  } catch (e) {
    console.error('❌ Check failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
