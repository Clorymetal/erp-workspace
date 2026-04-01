import dotenv from 'dotenv';
import path from 'path';

// Load environment variables dynamically allowing overrides from the monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';
import { prisma } from './db';

const PORT = process.env.PORT || 4000;

// Garantiza que las tablas necesarias existan en producción
// Independiente del estado de migraciones de Prisma
const ensureSchema = async () => {
  try {
    // Crear enum UserRole si no existe
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VIEWER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear tabla Core_User si no existe
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Core_User" (
        "id"        TEXT NOT NULL,
        "email"     TEXT NOT NULL,
        "name"      TEXT,
        "picture"   TEXT,
        "role"      "UserRole" NOT NULL DEFAULT 'VIEWER',
        "isActive"  BOOLEAN NOT NULL DEFAULT true,
        "lastLogin" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Core_User_pkey" PRIMARY KEY ("id")
      );
    `);

    // Crear índice único en email si no existe
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Core_User_email_key" ON "Core_User"("email");
    `);

    console.log('✅ Schema verificado: Core_User lista');
  } catch (err) {
    console.error('⚠️ Error al verificar schema:', err);
    // No interrumpimos el arranque por esto
  }
};

const startServer = async () => {
  try {
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`🚀 ERP Core Backend is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start ERP Core Backend:', error);
    process.exit(1);
  }
};

startServer();
