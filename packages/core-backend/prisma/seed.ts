import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed Maestro ERP Clorymetal...');

  // 1. Parámetros Globales (Provincias)
  const provincias = [
    { key: 'BA', value: 'Buenos Aires', label: 'Buenos Aires' },
    { key: 'SF', value: 'Santa Fe', label: 'Santa Fe' },
    { key: 'CB', value: 'Córdoba', label: 'Córdoba' },
    { key: 'ER', value: 'Entre Ríos', label: 'Entre Ríos' },
    { key: 'MZ', value: 'Mendoza', label: 'Mendoza' },
    { key: 'SL', value: 'San Luis', label: 'San Luis' },
    { key: 'SJ', value: 'San Juan', label: 'San Juan' },
    { key: 'LR', value: 'La Rioja', label: 'La Rioja' },
    { key: 'CT', value: 'Catamarca', label: 'Catamarca' },
    { key: 'TU', value: 'Tucumán', label: 'Tucumán' },
    { key: 'SA', value: 'Salta', label: 'Salta' },
    { key: 'JU', value: 'Jujuy', label: 'Jujuy' },
    { key: 'CH', value: 'Chaco', label: 'Chaco' },
    { key: 'FO', value: 'Formosa', label: 'Formosa' },
    { key: 'MI', value: 'Misiones', label: 'Misiones' },
    { key: 'CO', value: 'Corrientes', label: 'Corrientes' },
    { key: 'LP', value: 'La Pampa', label: 'La Pampa' },
    { key: 'NE', value: 'Neuquén', label: 'Neuquén' },
    { key: 'RN', value: 'Río Negro', label: 'Río Negro' },
    { key: 'CU', value: 'Chubut', label: 'Chubut' },
    { key: 'SC', value: 'Santa Cruz', label: 'Santa Cruz' },
    { key: 'TF', value: 'Tierra del Fuego', label: 'Tierra del Fuego' }
  ];

  console.log('  - Cargando Provincias...');
  for (const p of provincias) {
    await prisma.core_Parameter.upsert({
      where: { category_key: { category: 'PROVINCIA', key: p.key } },
      update: { value: p.value, label: p.label },
      create: { category: 'PROVINCIA', key: p.key, value: p.value, label: p.label }
    });
  }

  // 2. Parámetros Globales (Condición Fiscal)
  const condFiscales = [
    { key: 'RI', value: 'Responsable Inscripto', label: 'Responsable Inscripto' },
    { key: 'MT', value: 'Monotributista', label: 'Monotributista' },
    { key: 'EXE', value: 'Exento', label: 'Exento' },
    { key: 'CF', value: 'Consumidor Final', label: 'Consumidor Final' }
  ];

  console.log('  - Cargando Condiciones Fiscales...');
  for (const cf of condFiscales) {
    await prisma.core_Parameter.upsert({
      where: { category_key: { category: 'COND_FISCAL', key: cf.key } },
      update: { value: cf.value, label: cf.label },
      create: { category: 'COND_FISCAL', key: cf.key, value: cf.value, label: cf.label }
    });
  }

  // 3. Proveedor de Ejemplo (Opcional, para pruebas de 500 error una vez migrado)
  console.log('  - Cargando Proveedores de ejemplo...');
  await prisma.prov_Provider.upsert({
    where: { taxId: '30-11111111-9' },
    update: {},
    create: {
      businessName: 'Distribuidora Central S.A.',
      taxId: '30-11111111-9',
      address: 'Av. Siempre Viva 742',
      province: 'Santa Fe',
      taxCondition: 'Responsable Inscripto',
      isCtaCte: true
    }
  });

  console.log('✅ Seed finalizado correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
