import { PrismaClient, InvoiceType, InvoiceStatus } from '@prisma/client';
import * as xlsx from 'xlsx';
import path from 'path';

/**
 * Script de Sincronización Total desde Excel (Compras.xlsx)
 * 
 * Este script:
 * 1. Limpia las tablas de Compras (Facturas, Pagos, Cheques).
 * 2. Sincroniza Parámetros básicos.
 * 3. Upsert de Proveedores desde la hoja "Proveedores".
 * 4. Inyecta Facturas desde la hoja "Registros" como fuente única de verdad.
 */

// Helper para convertir fechas de Excel (número de serie o Date) a Date de JS
function parseExcelDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    // Offset de Excel: 1900-1-1 es 1. Unix epoch: 1970-1-1.
    // La diferencia es de aproximadamente 25569 días.
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    // Ajuste de zona horaria si fuera necesario, pero para fechas contables esto suele bastar
    return date;
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

async function main() {
  if (process.env.ALLOW_DATA_OVERWRITE !== 'true') {
    console.error('❌ ERROR DE SEGURIDAD: Sincronización bloqueada.');
    console.error('La App es ahora la fuente de verdad. El uso de este script sobrescribiría datos nuevos.');
    console.error('Si REALMENTE necesitas volver a importar desde Excel, define ALLOW_DATA_OVERWRITE=true');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  console.log(`🚀 Iniciando sincronización en: ${dbUrl?.includes('neon.tech') ? 'PRODUCCIÓN (Neon)' : 'LOCAL (Docker)'}`);
  
  const prisma = new PrismaClient();

  try {
    // 1. LIMPIEZA DE TABLAS DE COMPRAS (En orden de dependencia)
    console.log('🧹 Limpiando datos antiguos de Compras...');
    await prisma.prov_Check.deleteMany({});
    await prisma.prov_PaymentItem.deleteMany({});
    await prisma.prov_Payment.deleteMany({});
    await prisma.prov_Invoice.deleteMany({});
    console.log('✅ Tablas de compras limpias (Empleados no afectados).');

    // 2. PARÁMETROS BÁSICOS
    const basicParams = [
      { category: 'PROVINCIA', key: 'CHACO', value: 'Chaco', label: 'Chaco' },
      { category: 'PROVINCIA', key: 'BSAS', value: 'Bs. As.', label: 'Buenos Aires' },
      { category: 'COND_FISCAL', key: 'RI', value: 'Responsable Inscripto', label: 'Resp. Inscrito' },
      { category: 'COND_FISCAL', key: 'MT', value: 'Monotributo', label: 'Monotributo' },
    ];
    for (const p of basicParams) {
      await prisma.core_Parameter.upsert({
        where: { category_key: { category: p.category, key: p.key } },
        update: {},
        create: p
      });
    }

    // 3. CARGAR EXCEL
    const excelPath = path.resolve(__dirname, '../../../docs/Compras.xlsx');
    const workbook = xlsx.readFile(excelPath, { cellDates: true });

    // 4. PROVEEDORES (Hoja: Proveedores)
    console.log('👥 Sincronizando proveedores...');
    const provSheet = workbook.Sheets['Proveedores'];
    const provRows: any[] = xlsx.utils.sheet_to_json(provSheet);
    
    for (const row of provRows) {
      const taxId = String(row['CUIT'] || '').replace(/-/g, '').trim();
      if (!taxId || taxId === 'undefined') continue;

      await prisma.prov_Provider.upsert({
        where: { taxId },
        update: {
          businessName: String(row['Razón Social'] || row['Nombre'] || '').trim(),
          address: String(row['Domicilio'] || '').trim(),
          postalCode: String(row['CP'] || '').trim(),
          province: String(row['Provincia'] || '').trim(),
          taxCondition: String(row['Condición Fiscal'] || '').trim(),
          isCtaCte: String(row['Cta Cte'] || '').toUpperCase() === 'SI'
        },
        create: {
          taxId,
          businessName: String(row['Razón Social'] || row['Nombre'] || '').trim(),
          address: String(row['Domicilio'] || '').trim(),
          postalCode: String(row['CP'] || '').trim(),
          province: String(row['Provincia'] || '').trim(),
          taxCondition: String(row['Condición Fiscal'] || '').trim(),
          isCtaCte: String(row['Cta Cte'] || '').toUpperCase() === 'SI'
        }
      });
    }

    // Mapeo de proveedores para FKs
    const allProviders = await prisma.prov_Provider.findMany({ select: { id: true, taxId: true } });
    const providerMap = new Map(allProviders.map(p => [p.taxId, p.id]));

    // 5. FACTURAS (Hoja: Registros) - Fuente de Verdad
    console.log('🧾 Registrando facturas desde hoja "Registros"...');
    const regSheet = workbook.Sheets['Registros'];
    
    // Usamos matriz de filas para mayor precisión con las columnas
    const rows = xlsx.utils.sheet_to_json(regSheet, { header: 1 }) as any[][];
    const headers = rows[0].map(h => String(h || '').trim());
    
    const findIdx = (possibleNames: string[]) => {
      const normalizedNames = possibleNames.map(n => n.toLowerCase().trim());
      return headers.findIndex(h => normalizedNames.includes(h.toLowerCase().trim()));
    };

    const idx = {
      fechaEmi: findIdx(['Fecha Emisión']),
      fechaRec: findIdx(['Fecha Recepción']),
      tipo: findIdx(['Tipo']),
      suc: findIdx(['Suc.']),
      nro: findIdx(['Número']),
      cuit: findIdx(['CUIT']),
      razon: findIdx(['Razón Social o Denominación Cliente', 'Proveedor']),
      neto: findIdx(['Neto Gravado']),
      iva: findIdx(['IVA Liquidado']),
      noGrab: findIdx(['Conceptos NG/EX']),
      perc: findIdx(['Perc./Ret.']),
      total: findIdx(['Total']),
      ctacte: findIdx(['Cta cte']),
      pagado: findIdx(['Pagado']),
      orden: findIdx(['Orden']),
      periodo: findIdx(['Período'])
    };

    console.log('Mapeo de columnas (normalizado):', idx);

    let count = 0;
    // Empezamos desde i=1 para saltar cabeceras
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[idx.cuit]) continue;

      const taxId = String(row[idx.cuit] || '').replace(/-/g, '').trim();
      let providerId = providerMap.get(taxId);
      
      if (!providerId) {
        const nameIdx = idx.razon !== -1 ? idx.razon : idx.cuit + 1; // Fallback al siguiente si no hay razon
        const newProvName = String(row[nameIdx] || 'Proveedor ' + taxId).trim();
        const newProv = await prisma.prov_Provider.create({
          data: { taxId, businessName: newProvName, isCtaCte: true }
        });
        providerId = newProv.id;
        providerMap.set(taxId, providerId);
      }

      // Mapeo de Tipo
      const tipoStr = String(row[idx.tipo] || '').toUpperCase();
      let invoiceType: InvoiceType = InvoiceType.FACTURA_A;
      if (tipoStr.includes('B')) invoiceType = InvoiceType.FACTURA_B;
      if (tipoStr.includes('C')) invoiceType = InvoiceType.FACTURA_C;
      if (tipoStr.includes('NC') || tipoStr.includes('CREDITO')) invoiceType = InvoiceType.NOTA_CREDITO;

      const issueDate = parseExcelDate(row[idx.fechaEmi]);
      let ivaPeriod = '';
      if (row[idx.periodo]) {
        const pDate = parseExcelDate(row[idx.periodo]);
        ivaPeriod = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
      } else {
        ivaPeriod = `${issueDate.getFullYear()}-${String(issueDate.getMonth() + 1).padStart(2, '0')}`;
      }

      await prisma.prov_Invoice.create({
        data: {
          providerId: providerMap.get(taxId)!,
          invoiceType,
          pointOfSale: String(row[idx.suc] || '0').padStart(4, '0'),
          invoiceNumber: String(row[idx.nro] || '0').padStart(8, '0'),
          issueDate,
          receptionDate: row[idx.fechaRec] ? parseExcelDate(row[idx.fechaRec]) : issueDate,
          dueDate: row[idx.pagado] && String(row[idx.pagado]).toUpperCase().includes('PAGADO') ? issueDate : null,
          netAmount: Number(row[idx.neto] || 0),
          taxAmount: Number(row[idx.iva] || 0),
          perceptionAmount: Number(row[idx.perc] || 0),
          nonTaxedAmount: Number(row[idx.noGrab] || 0),
          totalAmount: Number(row[idx.total] || 0),
          isCtaCte: String(row[idx.ctacte] || '').toUpperCase() === 'SI' || String(row[idx.ctacte] || '').toUpperCase() === 'S',
          status: String(row[idx.pagado] || '').toUpperCase().includes('PAGADO') ? InvoiceStatus.PAGADA : InvoiceStatus.PENDIENTE,
          ivaPeriod,
          ivaNumber: row[idx.orden] ? Number(row[idx.orden]) : null
        }
      });
      count++;
    }

    console.log(`✨ Sincronización exitosa. ${count} facturas inyectadas.`);

  } catch (error) {
    console.error('❌ Error en la sincronización:', error);
  } finally {
    await prisma.$disconnect();
  }
}

sync();
