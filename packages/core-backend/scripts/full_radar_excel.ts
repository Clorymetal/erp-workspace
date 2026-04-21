import * as xlsx from 'xlsx';
import path from 'path';

async function main() {
  const excelPath = path.resolve(__dirname, '../../../docs/Compras.xlsx');
  const workbook = xlsx.readFile(excelPath);
  
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    data.forEach((row, i) => {
      row.forEach((cell, j) => {
        const cellVal = String(cell || '').toLowerCase();
        if (cellVal.includes('resistencia') || cellVal.includes('chaco') || cellVal.includes('ciudad')) {
          console.log(`[Hoja: ${sheetName}] Fila: ${i}, Col: ${j} -> Valor: ${cell}`);
        }
      });
    });
  });
}

main();
