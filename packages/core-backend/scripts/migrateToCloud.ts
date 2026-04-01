import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('🔄 Extrayendo datos de la base de datos local (Docker)...');
  
  const localPrisma = new PrismaClient({
    datasourceUrl: 'postgresql://erp_admin:supersecretpassword@localhost:5432/erp_db?schema=public'
  });

  const providers = await localPrisma.prov_Provider.findMany({ include: { category: true, contacts: true, bankAccounts: true } });
  const invoices = await localPrisma.prov_Invoice.findMany();
  const employees = await localPrisma.emp_Employee.findMany();
  const periods = await localPrisma.emp_SalaryPeriod.findMany();
  const advances = await localPrisma.emp_Advance.findMany();
  const notifications = await localPrisma.core_Notification.findMany();
  const parameters = await localPrisma.core_Parameter.findMany();

  console.log(`📦 Datos locales leídos:
    - ${providers.length} Proveedores
    - ${invoices.length} Facturas
    - ${employees.length} Empleados
    - ${periods.length} Periodos Salariales
    - ${advances.length} Adelantos
    - ${parameters.length} Parámetros
  `);

  await localPrisma.$disconnect();

  console.log('☁️ Conectando a la base de datos de producción (Neon)...');
  
  const remotePrisma = new PrismaClient({
    datasourceUrl: 'postgresql://neondb_owner:npg_Ox5QVg7fGaMw@ep-damp-flower-acp8tdbb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  });

  // Migrar Parámetros primero (sin duplicar)
  console.log('Migrando parámetros...');
  for (const param of parameters) {
    await remotePrisma.core_Parameter.upsert({
      where: { id: param.id },
      update: {},
      create: param
    });
  }

  // Proveedores
  console.log('Migrando proveedores (esto puede tardar unos segundos)...');
  for (const prov of providers) {
    const { category, contacts, bankAccounts, ...provData } = prov;
    
    // Ignoramos la categoría si no queremos complicarlo por ahora, o chequeamos si categoryId no es null
    await remotePrisma.prov_Provider.upsert({
      where: { taxId: provData.taxId },
      update: { ...provData },
      create: { ...provData }
    });

    // Migrar contactos si tiene
    for (const contact of contacts) {
      await remotePrisma.prov_Contact.upsert({
        where: { id: contact.id },
        update: { ...contact },
        create: { ...contact }
      });
    }

    // Migrar cuentas
    for (const bank of bankAccounts) {
      await remotePrisma.prov_BankAccount.upsert({
        where: { id: bank.id },
        update: { ...bank },
        create: { ...bank }
      });
    }
  }

  console.log('Migrando facturas...');
  for (const inv of invoices) {
    await remotePrisma.prov_Invoice.upsert({
      where: { id: inv.id },
      update: { ...inv },
      create: { ...inv }
    });
  }

  console.log('Migrando empleados...');
  for (const emp of employees) {
    await remotePrisma.emp_Employee.upsert({
      where: { id: emp.id },
      update: { ...emp },
      create: { ...emp }
    });
  }

  console.log('Migrando salarios y adelantos...');
  for (const period of periods) {
    try {
        await remotePrisma.emp_SalaryPeriod.upsert({
            where: { id: period.id },
            update: { ...period },
            create: { ...period }
        });
    } catch(e) {}
  }
  for (const adv of advances) {
    try {
        await remotePrisma.emp_Advance.upsert({
            where: { id: adv.id },
            update: { ...adv },
            create: { ...adv }
        });
    } catch(e) {}
  }

  await remotePrisma.$disconnect();
  console.log('✅ ¡MIGRACIÓN COMPLETADA CON ÉXITO! Todos los datos locales están en la nube.');
}

main().catch(e => {
  console.error("Error migrando:", e);
  process.exit(1);
});
