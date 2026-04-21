import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';
import path from 'path';

async function main() {
  const excelPath = path.resolve(__dirname, '../../../docs/Compras.xlsx');
  
  try {
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets['Proveedores'];
    if (!sheet) {
      console.log('Sheet Proveedores not found');
      return;
    }
    const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    console.log('Columnas Proveedores:', rawRows[0]);
    rawRows.slice(0, 5).forEach((row, i) => {
      console.log(`[Fila ${i}]`, row);
    });
  } catch (error) {
    console.error(error);
  }
}
main();
