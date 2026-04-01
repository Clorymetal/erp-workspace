import { PrismaClient, PayType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed de Empleados...');

  // 1. Limpiar datos viejos de Empleados (Cascada invertida)
  await prisma.emp_Advance.deleteMany();
  await prisma.emp_SalaryPeriod.deleteMany();
  await prisma.emp_Employee.deleteMany();

  console.log('✔️  Tablas de empleados limpiadas');

  // Constantes del Periodo
  const PERIOD_YEAR = 2026;
  const PERIOD_MONTH = 3;

  type AdvanceInput = { date: Date; cash?: number; transfer?: number; };

  // 2. Definición Mapeada del Excel (Marzo 2026)
  const initialData: Array<{
    name: string;
    payType: PayType;
    baseSalary: number;
    firstInstallment?: number;
    secondInstallment?: number;
    advances: AdvanceInput[];
  }> = [
    {
      name: 'Jorge',
      payType: PayType.MONTHLY,
      baseSalary: 903681,
      advances: [{ date: new Date(2026, 2, 21), cash: 200000 }] // Marzo es mes 2 en JS Date
    },
    {
      name: 'Alfredo',
      payType: PayType.MONTHLY,
      baseSalary: 802899,
      advances: [
        { date: new Date(2026, 2, 14), cash: 152640 },
        { date: new Date(2026, 2, 21), cash: 200000 }
      ]
    },
    {
      name: 'Antonio',
      payType: PayType.MONTHLY,
      baseSalary: 802899,
      advances: [{ date: new Date(2026, 2, 21), cash: 200000 }]
    },
    {
      name: 'Gabriel',
      payType: PayType.MONTHLY,
      baseSalary: 1500000,
      advances: [
        { date: new Date(2026, 1, 28), cash: 64300, transfer: 0 }, // Feb es 1
        { date: new Date(2026, 2, 7), cash: 200000, transfer: 200000 },
        { date: new Date(2026, 2, 11), cash: 200000, transfer: 200000 },
        { date: new Date(2026, 2, 21), cash: 250000, transfer: 0 }
      ]
    },
    {
      name: 'Jose',
      payType: PayType.BIWEEKLY,
      baseSalary: 1023268,
      firstInstallment: 509179,
      secondInstallment: 514089,
      advances: [{ date: new Date(2026, 2, 21), cash: 250000 }]
    },
    {
      name: 'Nestor',
      payType: PayType.BIWEEKLY,
      baseSalary: 1236116,
      firstInstallment: 517809,
      secondInstallment: 718307,
      advances: [{ date: new Date(2026, 2, 21), cash: 250000 }]
    },
    {
      name: 'Nino',
      payType: PayType.BIWEEKLY,
      baseSalary: 870969,
      firstInstallment: 432743,
      secondInstallment: 438226,
      advances: [{ date: new Date(2026, 2, 21), cash: 200000 }]
    }
  ];

  // 3. Procesar y poblar base de datos
  for (const data of initialData) {
    // A) Crear empleado
    const employee = await prisma.emp_Employee.create({
      data: {
        name: data.name,
        payType: data.payType,
        baseSalary: data.baseSalary,
      }
    });

    console.log(`👤 Empleado creado: ${employee.name}`);

    // B) Crear periodo inicial (Marzo '26)
    let totalAdvances = 0;
    
    // Calculo manual primero para inyectarlo directo al Periodo
    data.advances.forEach(adv => {
      totalAdvances += (adv.cash || 0) + (adv.transfer || 0);
    });

    const period = await prisma.emp_SalaryPeriod.create({
      data: {
        employeeId: employee.id,
        periodYear: PERIOD_YEAR,
        periodMonth: PERIOD_MONTH,
        baseSalary: data.baseSalary,
        firstInstallment: data.firstInstallment || null,
        secondInstallment: data.secondInstallment || null,
        totalAdvances: totalAdvances,
        balance: data.baseSalary - totalAdvances, // Sueldo menos adelantos
        isClosed: false
      }
    });

    // C) Registrar los adelantos, manteniendo la trazabilidad histórica de los saldos
    let accumulated = 0;
    for (const adv of data.advances) {
      const advanceAmount = (adv.cash || 0) + (adv.transfer || 0);
      accumulated += advanceAmount;
      const balanceAfterAdvance = data.baseSalary - accumulated;

      await prisma.emp_Advance.create({
        data: {
          employeeId: employee.id,
          periodId: period.id,
          date: adv.date,
          cashAmount: adv.cash || 0,
          transferAmount: adv.transfer || 0,
          totalAmount: advanceAmount,
          accumulated: accumulated,
          balance: balanceAfterAdvance
        }
      });
    }
  }

  console.log('✅ Base de datos de empleados inicializada con "Marzo \'26".');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
