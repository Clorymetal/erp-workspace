import { PrismaClient, InvoiceType, InvoiceStatus } from '@prisma/client';
import * as xlsx from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

// Mapeo básico de provincias basado en el Excel detectado
const provinceMap: Record<string, string> = {
  '00': 'Capital Federal',
  '0': 'Capital Federal',
  '01': 'Bs. As.',
  '1': 'Bs. As.',
  '02': 'Catamarca',
  '2': 'Catamarca',
  '03': 'Córdoba',
  '3': 'Córdoba',
  '04': 'Corrientes',
  '4': 'Corrientes',
  '05': 'Entre Ríos',
  '5': 'Entre Ríos',
  '06': 'Jujuy',
  '6': 'Jujuy',
  '07': 'Mendoza',
  '7': 'Mendoza',
  '08': 'La Rioja',
  '8': 'La Rioja',
  '09': 'Salta',
  '9': 'Salta',
  '10': 'San Juan',
  '11': 'San Luis',
  '12': 'Santa Fé',
  '13': 'Santiago del Estero',
  '14': 'Tucumán',
  '16': 'Chaco',
  '17': 'Chubut',
  '18': 'Formosa',
  '19': 'Misiones',
  '20': 'Neuquén',
  '21': 'La Pampa',
  '22': 'Río Negro',
  '23': 'Santa Cruz',
  '24': 'Tierra del Fuego',
  '90': 'Indeterminado'
};

async function seed() {
  console.log('🌱 Iniciando importación avanzada (Hojas: Proveedores, Facturas) desde Excel...');
  
  // 0. SEMBRAR PARÁMETROS BÁSICOS SI NO EXISTEN
  const basicParams = [
    // Provincias
    { category: 'PROVINCIA', key: 'CHACO', value: 'Chaco', label: 'Chaco' },
    { category: 'PROVINCIA', key: 'S_FE', value: 'Santa Fe', label: 'Santa Fe' },
    { category: 'PROVINCIA', key: 'CBA', value: 'Córdoba', label: 'Córdoba' },
    { category: 'PROVINCIA', key: 'BSAS', value: 'Bs. As.', label: 'Buenos Aires' },
    { category: 'PROVINCIA', key: 'S_CRUZ', value: 'Santa Cruz', label: 'Santa Cruz' },
    // Condiciones Fiscales
    { category: 'COND_FISCAL', key: 'RI', value: 'Responsable Inscripto', label: 'Resp. Inscrito' },
    { category: 'COND_FISCAL', key: 'MT', value: 'Monotributo', label: 'Monotributo' },
    { category: 'COND_FISCAL', key: 'EX', value: 'Exento', label: 'Exento' },
    { category: 'COND_FISCAL', key: 'CF', value: 'Consumidor Final', label: 'Cons. Final' },
    // Tipos de Factura (Enums Mapped)
    { category: 'FACTO_TYPE', key: 'FACTURA_A', value: 'Factura A', label: 'Factura A' },
    { category: 'FACTO_TYPE', key: 'FACTURA_B', value: 'Factura B', label: 'Factura B' },
    { category: 'FACTO_TYPE', key: 'NOTA_CREDITO', value: 'Nota de Crédito', label: 'N. Crédito' },
  ];

  for (const p of basicParams) {
    await prisma.core_Parameter.upsert({
      where: { category_key: { category: p.category, key: p.key } },
      update: {},
      create: p
    });
  }
  console.log('✅ Parámetros básicos sembrados.');

  const excelPath = path.resolve(__dirname, '../../docs/Compras.xlsx');
  const workbook = xlsx.readFile(excelPath, { cellDates: true });

  // 1. CARGAR PROVEEDORES DE LA HOJA 'Proveedores'
  const provSheet = workbook.Sheets['Proveedores'];
  const provData: any[] = xlsx.utils.sheet_to_json(provSheet);
  const providersMap = new Map();

  console.log(`📊 Procesando ${provData.length} proveedores de la hoja 'Proveedores'...`);

  for (const row of provData) {
    const cuit = String(row['CUIT'] || '').trim();
    const businessName = String(row['Razón Social'] || row['Nombre'] || '').trim();
    if (!cuit || cuit === 'undefined') continue;

    const provCode = String(row['Provincia'] || '').trim();
    const provinceName = provinceMap[provCode] || provCode;

    providersMap.set(cuit, {
      businessName,
      taxId: cuit,
      address: String(row['Domicilio'] || '').trim(),
      postalCode: String(row['CP'] || '').trim(),
      province: provinceName,
      taxCondition: String(row['Condición Fiscal'] || '').trim(),
      discountRate: 0,
      isCtaCte: provinceName !== 'Chaco' && 
                !businessName.toUpperCase().includes('SPEED') && 
                !businessName.toUpperCase().includes('BULONERA'),
    });
  }

  // 2. CARGAR FACTURAS DE LA HOJA 'Facturas'
  const invSheet = workbook.Sheets['Facturas'];
  const invData: any[] = xlsx.utils.sheet_to_json(invSheet);
  const invoicesToCreate: any[] = [];

  console.log(`📊 Procesando ${invData.length} facturas de la hoja 'Facturas'...`);

  for (const row of invData) {
    const cuit = String(row['CUIT'] || '').trim();
    if (!cuit || cuit === 'undefined') continue;

    // Si el proveedor no estaba en la hoja 'Proveedores', lo agregamos con datos mínimos de esta fila
    if (!providersMap.has(cuit)) {
      providersMap.set(cuit, {
        businessName: String(row['Razón Social o Denominación Cliente '] || '').trim(),
        taxId: cuit,
        address: String(row['Domicilio'] || '').trim(),
        postalCode: String(row['C.P.'] || '').trim(),
        province: String(row['Pcia'] || '').trim(),
        taxCondition: String(row['Cond Fisc'] || '').trim(),
      });
    }

    // Mapeo de Tipo Comprobante
    const tipo = String(row['Tipo'] || '').toUpperCase();
    let invoiceType: InvoiceType = InvoiceType.FACTURA_A;
    if (tipo.includes('NOTA DE CREDITO') || tipo.includes('NOTA DE CRÉDITO')) {
      invoiceType = InvoiceType.NOTA_CREDITO;
    } else if (tipo.includes('FACTURA B')) {
      invoiceType = InvoiceType.FACTURA_B;
    } else if (tipo.includes('FACTURA C')) {
      invoiceType = InvoiceType.FACTURA_C;
    }

    const pos = String(row['Suc.'] || '0').padStart(4, '0');
    const number = String(row['Número'] || '0').padStart(8, '0');
    const isCtaCte = String(row['Cta cte'] || '').toUpperCase().includes('SI') || String(row['Cta cte'] || '').toUpperCase() === 'S';

    invoicesToCreate.push({
      providerTaxId: cuit,
      invoiceType,
      pointOfSale: pos,
      invoiceNumber: number,
      issueDate: row['Fecha Emisión'] instanceof Date ? row['Fecha Emisión'] : new Date(),
      receptionDate: row['Fecha Recepción'] instanceof Date ? row['Fecha Recepción'] : null,
      dueDate: row['Vencimiento'] instanceof Date ? row['Vencimiento'] : null,
      netAmount: Number(row['Neto Gravado'] || 0),
      taxAmount: Number(row['IVA Liquidado'] || 0),
      perceptionAmount: Number(row['Perc./Ret.'] || 0),
      nonTaxedAmount: Number(row['Conceptos NG/EX'] || 0),
      totalAmount: Number(row['Total'] || 0),
      isCtaCte,
      status: row['Pagado'] && Number(row['Pagado']) >= Number(row['Total']) ? InvoiceStatus.PAGADA : InvoiceStatus.PENDIENTE
    });
  }

  // 3. PERSISTIR EN DB
  console.log(`💾 Guardando en base de datos...`);

  // Upsert Proveedores
  for (const p of providersMap.values()) {
    await prisma.prov_Provider.upsert({
      where: { taxId: p.taxId },
      update: p,
      create: p
    });
  }
  console.log(`✅ Proveedores sincronizados.`);

  // Mapa de IDs para vinculación
  const allProvsDB = await prisma.prov_Provider.findMany({ select: { id: true, taxId: true } });
  const taxIdToIdMap = new Map(allProvsDB.map(p => [p.taxId, p.id]));

  // Upsert Facturas
  let invCreated = 0;
  for (const inv of invoicesToCreate) {
    const providerId = taxIdToIdMap.get(inv.providerTaxId);
    if (!providerId) continue;

    const { providerTaxId, ...data } = inv;
    try {
      await prisma.prov_Invoice.upsert({
        where: {
          providerId_pointOfSale_invoiceNumber: {
            providerId,
            pointOfSale: data.pointOfSale,
            invoiceNumber: data.invoiceNumber
          }
        },
        update: data,
        create: { ...data, providerId }
      });
      invCreated++;
    } catch (e) {
      // Ignoramos errores de duplicados si ocurren por razones ajenas al unique detectado
    }
  }

  console.log(`✅ ¡Importación completa! ${invCreated} facturas procesadas.`);
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
