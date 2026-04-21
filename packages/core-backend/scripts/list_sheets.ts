import * as xlsx from 'xlsx';
import path from 'path';

const files = [
  'docs/Compras.xlsx',
  'docs/Nueva carpeta/marzo-26.xlsx'
];

files.forEach(f => {
  const p = path.resolve(__dirname, '../../../', f);
  try {
    const wb = xlsx.readFile(p);
    console.log(`File: ${f} -> Sheets: ${wb.SheetNames.join(', ')}`);
  } catch (e) {
    console.log(`Could not read ${f}`);
  }
});
