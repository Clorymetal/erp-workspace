const xlsx = require('xlsx');
const path = require('path');
const filePath = 'd:/E/Clorymetal/Desarrollo/Aplicaciones/erp-workspace/docs/Nueva carpeta/marzo-26.xlsx';
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
console.log(JSON.stringify(data.slice(0, 5), null, 2));
