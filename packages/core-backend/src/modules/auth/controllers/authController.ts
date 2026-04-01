import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../db';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'erp-super-secret-key';

export const googleLogin = async (req: Request, res: Response) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { email, name, picture } = payload;

    // Buscar usuario usando SQL directo (evita dependencia del Prisma client generado)
    const existingUsers = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "Core_User" WHERE "email" = $1 LIMIT 1`, email
    );

    let user = existingUsers[0] || null;

    if (!user) {
      // Verificar si es el primer usuario para asignarle rol ADMIN
      const countResult = await prisma.$queryRawUnsafe<any[]>(
        `SELECT COUNT(*) as count FROM "Core_User"`
      );
      const isFirstUser = parseInt(countResult[0]?.count || '0') === 0;
      const role = isFirstUser ? 'ADMIN' : 'VIEWER';
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await prisma.$executeRawUnsafe(
        `INSERT INTO "Core_User" ("id", "email", "name", "picture", "role", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, true, $6, $7)`,
        id, email, name ?? null, picture ?? null, role, now, now
      );

      const newUsers = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM "Core_User" WHERE "id" = $1`, id
      );
      user = newUsers[0];
    }

    // Actualizar último login
    await prisma.$executeRawUnsafe(
      `UPDATE "Core_User" SET "lastLogin" = $1 WHERE "id" = $2`,
      new Date().toISOString(), user.id
    );

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Error during Google Login:', error);
    res.status(500).json({
      error: 'Authentication failed',
      detail: error?.message || String(error),
    });
  }
};

export const getCurrentUser = async (req: any, res: Response) => {
  res.json(req.user);
};
