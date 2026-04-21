import { Request, Response } from 'express';
import { prisma } from '../../db';

export const getBusinessConfig = async (req: Request, res: Response) => {
  try {
    let config = await prisma.core_BusinessConfig.findUnique({
      where: { id: 'singleton' }
    });

    if (!config) {
      // Si no existe, creamos el inicial con datos sugeridos por Gabriel
      config = await prisma.core_BusinessConfig.create({
        data: {
          id: 'singleton',
          name: 'Clorymetal SRL',
          taxId: '33-12345678-9',
          address: 'Av. Siempre Viva 123',
          city: 'Resistencia',
          province: 'Chaco',
          phone: '3624-000000',
          email: 'contacto@clorymetal.com.ar'
        }
      });
    }

    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBusinessConfig = async (req: Request, res: Response) => {
  try {
    const { id, updatedAt, ...data } = req.body;
    const config = await prisma.core_BusinessConfig.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { ...data, id: 'singleton' }
    });
    res.json(config);
  } catch (error: any) {
    console.error('Error updating business config:', error);
    res.status(500).json({ error: error.message });
  }
};
