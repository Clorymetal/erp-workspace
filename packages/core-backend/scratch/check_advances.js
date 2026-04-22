const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log("Checking emp_SalaryPeriod for March and April 2026...");
    const periods = await prisma.emp_SalaryPeriod.findMany({
      where: {
        periodYear: 2026,
        periodMonth: { in: [3, 4] }
      },
      include: {
        employee: { select: { name: true } },
        advances: true
      }
    });

    console.log(`Found ${periods.length} periods.`);
    periods.forEach(p => {
      console.log(`- Employee: ${p.employee.name} (${p.employeeId}), Month: ${p.periodMonth}, Advances: ${p.advances.length}, Balance: ${p.balance}`);
    });

    if (periods.length === 0) {
      console.log("No periods found in DB for these months.");
    }

  } catch (e) {
    console.error("Error checking DB:", e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
