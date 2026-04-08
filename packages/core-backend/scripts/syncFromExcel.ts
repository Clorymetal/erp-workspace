import { PrismaClient, InvoiceType, InvoiceStatus } from '@prisma/client';
import * as xlsx from 'xlsx';
import path from 'path';

/**
 * Script de Sincronización Total desde Excel (Compras.xlsx)
 */

function parseExcelDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date;
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

async function main() {
  if (process.env.ALLOW_DATA_OVERWRITE !== 'true') {
    console.error('❌ ERROR DE SEGURIDAD: Sincronización bloqueada.');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log('🧹 Limpiando datos antiguos de Compras...');
    await prisma.prov_Check.deleteMany({});
    await prisma.prov_PaymentItem.deleteMany({});
    await prisma.prov_Payment.deleteMany({});
    await prisma.prov_Invoice.deleteMany({});

    const excelPath = path.resolve(__dirname, '../../../docs/Compras.xlsx');
    const workbook = xlsx.readFile(excelPath, { cellDates: true });

    // 4. PROVEEDORES
    console.log('👥 Sincronizando proveedores...');
    const provSheet = workbook.Sheets['Proveedores'];
    const provRawRows = xlsx.utils.sheet_to_json(provSheet, { header: 1 }) as any[][];
    const provHeaders = provRawRows[0].map(h => String(h || '').trim());
    
    const findProvIdx = (possibleNames: string[]) => {
      const normalizedNames = possibleNames.map(n => n.toLowerCase().trim());
      return provHeaders.findIndex(h => normalizedNames.includes(h.toLowerCase().trim()));
    };

    const pIdx = {
      cuit: findProvIdx(['CUIT']),
      razon: findProvIdx(['Razón Social', 'Nombre']),
      domicilio: findProvIdx(['Domicilio']),
      cp: findProvIdx(['CP']),
      provincia: findProvIdx(['Provincia']),
      condicion: findProvIdx(['Condición Fiscal']),
      ctacte: findProvIdx(['Cta Cte']),
      venc: findProvIdx(['Vencimiento', 'Días']),
      neto: findProvIdx(['Neto', 'NETO'])
    };

    for (let i = 1; i < provRawRows.length; i++) {
      const row = provRawRows[i];
      const taxId = String(row[pIdx.cuit] || '').replace(/-/g, '').trim();
      if (!taxId || taxId === 'undefined') continue;

      const expirationDays = pIdx.venc !== -1 ? Number(row[pIdx.venc] || 0) : 0;

      await prisma.prov_Provider.upsert({
        where: { taxId },
        update: {
          businessName: String(row[pIdx.razon] || '').trim(),
          isCtaCte: String(row[pIdx.ctacte] || '').toUpperCase() === 'SI' || String(row[pIdx.ctacte] || '').toUpperCase() === 'S',
          expirationDays: expirationDays,
          netAmountCode: pIdx.neto !== -1 ? String(row[pIdx.neto] || '').trim() : null
        },
        create: {
          taxId,
          businessName: String(row[pIdx.razon] || '').trim(),
          isCtaCte: String(row[pIdx.ctacte] || '').toUpperCase() === 'SI' || String(row[pIdx.ctacte] || '').toUpperCase() === 'S',
          expirationDays: expirationDays,
          netAmountCode: pIdx.neto !== -1 ? String(row[pIdx.neto] || '').trim() : null
        }
      });
    }

    const allProviders = await prisma.prov_Provider.findMany({ select: { id: true, taxId: true, expirationDays: true } });
    const providerMap = new Map(allProviders.map(p => [p.taxId, p.id]));
    const providerDaysMap = new Map(allProviders.map(p => [p.taxId, p.expirationDays]));

    // 5. FACTURAS
    console.log('🧾 Registrando facturas...');
    const regSheet = workbook.Sheets['Registros'];
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

    let count = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[idx.cuit]) continue;
      const taxId = String(row[idx.cuit] || '').replace(/-/g, '').trim();
      const providerId = providerMap.get(taxId);
      if (!providerId) continue;

      const issueDate = parseExcelDate(row[idx.fechaEmi]);
      
      // CALCULO VENCIMIENTO
      let dueDate: Date | null = null;
      const days = providerDaysMap.get(taxId) || 0;
      if (days > 0) {
        dueDate = new Date(issueDate.getTime() + days * 24 * 60 * 60 * 1000);
      } else if (row[idx.pagado] && String(row[idx.pagado]).toUpperCase().includes('PAGADO')) {
        dueDate = issueDate;
      }

      const tipoStr = String(row[idx.tipo] || '').toUpperCase();
      let invoiceType: InvoiceType = InvoiceType.FACTURA_A;
      if (tipoStr.includes('B')) invoiceType = InvoiceType.FACTURA_B;
      if (tipoStr.includes('C')) invoiceType = InvoiceType.FACTURA_C;
      if (tipoStr.includes('NC') || tipoStr.includes('CREDITO')) invoiceType = InvoiceType.NOTA_CREDITO;

      let ivaPeriod = '';
      if (row[idx.periodo]) {
        const pDate = parseExcelDate(row[idx.periodo]);
        ivaPeriod = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
      } else {
        ivaPeriod = `${issueDate.getFullYear()}-${String(issueDate.getMonth() + 1).padStart(2, '0')}`;
      }

      await prisma.prov_Invoice.create({
        data: {
          providerId,
          invoiceType,
          pointOfSale: String(row[idx.suc] || '0').padStart(4, '0'),
          invoiceNumber: String(row[idx.nro] || '0').padStart(8, '0'),
          issueDate,
          receptionDate: row[idx.fechaRec] ? parseExcelDate(row[idx.fechaRec]) : issueDate,
          dueDate,
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
    console.log(`✨ Éxito: ${count} facturas sincronizadas.`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
