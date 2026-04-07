const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://neondb_owner:npg_Ox5QVg7fGaMw@ep-damp-flower-acp8tdbb-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  try {
    const sql = fs.readFileSync('local_dump.sql', 'utf8');
    const stmts = sql
      .split(';')
      .map(s => s.trim().replace(/^--.*$/gm, '').trim())
      .filter(s => s.startsWith('INSERT INTO') || s.startsWith('SELECT pg_catalog'));
      
    console.log(`Encontrados ${stmts.length} comandos. Empezando volcado en Neon...`);
    
    for (const stmt of stmts) {
       try {
         await prisma.$executeRawUnsafe(stmt);
       } catch (e) {
         if (e.meta && e.meta.code === '23505') {
           // Ignorar llaves duplicadas
         } else {
           console.error('Error insertando:', stmt.substring(0, 50) + '...', e.meta?.message || e.message);
         }
       }
    }
    
    console.log('✅ Importación exitosa.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
}

run();
