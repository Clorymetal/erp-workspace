const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Iniciando importación desde Excel (JavaScript version)...');
  
  const excelPath = path.resolve(__dirname, '../../docs/Compras.xlsx');
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  console.log(`📊 Leídas ${data.length} filas del Excel (Hoja: ${sheetName}).`);

  const providersMap = new Map();

  for (const row of data) {
    const cuit = row['CUIT'] ? String(row['CUIT']).trim() : null;
    const businessName = (row['Razón Social o Denominación Cliente '] || row['Razón Social o Denominación Cliente']) ? 
                         String(row['Razón Social o Denominación Cliente '] || row['Razón Social o Denominación Cliente']).trim() : null;
    
    if (cuit && cuit !== 'undefined' && businessName && businessName !== 'undefined') {
      providersMap.set(cuit, {
        businessName: businessName,
        taxId: cuit,
        province: row['Pcia'] ? String(row['Pcia']).trim() : '',
        postalCode: row['C.P.'] ? String(row['C.P.']).trim() : '',
        taxCondition: row['Cond Fisc'] ? String(row['Cond Fisc']).trim() : '',
        address: row['Domicilio'] ? String(row['Domicilio']).trim() : '',
      });
    }
  }

  console.log(`🔍 Identificados ${providersMap.size} proveedores únicos.`);

  let count = 0;
  for (const providerData of providersMap.values()) {
    try {
      await prisma.prov_Provider.upsert({
        where: { taxId: providerData.taxId },
        update: providerData,
        create: providerData,
      });
      count++;
      if (count % 50 === 0) console.log(`🚀 Procesados ${count} proveedores...`);
    } catch (err) {
      console.error(`❌ Error al importar ${providerData.businessName}:`, err.message);
    }
  }

  console.log(`✅ ¡Importación completa! Se procesaron ${count} proveedores.`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
