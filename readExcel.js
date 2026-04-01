const xlsx = require('xlsx');
const wb = xlsx.readFile('./docs/Compras.xlsx');
const sheet = wb.Sheets['Parámetros'];
const data = xlsx.utils.sheet_to_json(sheet).slice(0, 20);
console.log('Parámetros sample:', data);
