const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('docs/Compras.xlsx');
const sheet = workbook.Sheets['Registros'];
const range = xlsx.utils.decode_range(sheet['!ref']);
const headers = [];
for (let c = range.s.c; c <= range.e.c; ++c) {
  const cell = sheet[xlsx.utils.encode_cell({ r: range.s.r, c: c })];
  headers.push(cell ? cell.v : `COL_${c}`);
}
fs.writeFileSync('excel_headers.json', JSON.stringify(headers, null, 2));

// Escribir también la fila 2 para ver valores reales
const row2 = [];
for (let c = range.s.c; c <= range.e.c; ++c) {
  const cell = sheet[xlsx.utils.encode_cell({ r: range.s.r + 1, c: c })];
  row2.push(cell ? cell.v : null);
}
fs.writeFileSync('excel_row2.json', JSON.stringify(row2, null, 2));
console.log('Headers and Row 2 saved');
