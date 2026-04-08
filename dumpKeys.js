const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('docs/Compras.xlsx');
console.log('Sheets present:', workbook.SheetNames);
const sheetName = 'Registros';
const sheet = workbook.Sheets[sheetName];
if (!sheet) {
  console.log(`Sheet "${sheetName}" NOT found!`);
  process.exit(1);
}
const data = xlsx.utils.sheet_to_json(sheet);
if (data && data.length > 0) {
  fs.writeFileSync('excel_keys.json', JSON.stringify({
    keys: Object.keys(data[0]),
    sample: data[0]
  }, null, 2));
  console.log('Keys saved to excel_keys.json');
} else {
  console.log('Sheet is empty or rows could not be parsed');
}
