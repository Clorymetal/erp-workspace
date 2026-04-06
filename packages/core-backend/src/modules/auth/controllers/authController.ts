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

    let user = await prisma.core_User.findUnique({
      where: { email }
    });

    if (!user) {
      const userCount = await prisma.core_User.count();
      const isFirstUser = userCount === 0;
      const role = isFirstUser ? 'ADMIN' : 'VIEWER';

      user = await prisma.core_User.create({
        data: {
          email,
          name: name ?? null,
          picture: picture ?? null,
          role,
          isActive: true
        }
      });
    }

    // Actualizar último login
    user = await prisma.core_User.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

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
