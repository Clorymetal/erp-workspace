import { PrismaClient } from '@prisma/client';

async function syncFromProd() {
  const prodUrl = 'postgresql://neondb_owner:npg_Ox5QVg7fGaMw@ep-damp-flower-acp8tdbb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';
  const localUrl = 'postgresql://erp_admin:supersecretpassword@localhost:5432/erp_db?schema=public';

  const prodPrisma = new PrismaClient({
    datasources: { db: { url: prodUrl } }
  });

  const localPrisma = new PrismaClient({
    datasources: { db: { url: localUrl } }
  });

  console.log('🚀 Iniciando sincronización de Personal desde Producción (Neon)...');

  try {
    // 1. Obtener datos de PROD (Solo campos básicos garantizados)
    console.log('📡 Leyendo datos de Producción (Solo campos básicos)...');
    const prodEmployees = await prodPrisma.emp_Employee.findMany({
      select: {
        id: true,
        name: true,
        payType: true,
        baseSalary: true,
        isActive: true,
        salaryPeriods: {
          include: {
            advances: true
          }
        }
      }
    });

    console.log(`✅ Se encontraron ${prodEmployees.length} empleados en Producción.`);

    // 2. Limpiar locales (Cuidado: Solo tablas de empleados/sueldos)
    console.log('🧹 Limpiando base local para evitar duplicados...');
    await localPrisma.emp_Advance.deleteMany({});
    await localPrisma.emp_SalaryPeriod.deleteMany({});
    await localPrisma.emp_Employee.deleteMany({});

    // 3. Insertar en LOCAL
    console.log('📥 Insertando datos en Local...');
    for (const emp of prodEmployees) {
      const { salaryPeriods, ...empData } = emp;
      
      const createdEmp = await localPrisma.emp_Employee.create({
        data: {
            ...empData,
            id: emp.id // Mantener el mismo ID
        }
      });

      for (const period of salaryPeriods) {
        const { advances, ...periodData } = period;
        
        const createdPeriod = await localPrisma.emp_SalaryPeriod.create({
          data: {
            ...periodData,
            employeeId: createdEmp.id
          }
        });

        for (const adv of advances) {
          await localPrisma.emp_Advance.create({
            data: {
              ...adv,
              periodId: createdPeriod.id,
              employeeId: createdEmp.id
            }
          });
        }
      }
    }

    console.log('✨ ¡Sincronización exitosa! Desarrollo ahora tiene los datos reales.');

  } catch (error) {
    console.error('❌ Error en el trasplante de datos:', error);
  } finally {
    await prodPrisma.$disconnect();
    await localPrisma.$disconnect();
  }
}

syncFromProd();
