import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getParameters = async (category?: string) => {
  return await prisma.core_Parameter.findMany({
    where: category ? { category, isActive: true } : { isActive: true },
    orderBy: { label: 'asc' }
  });
};

export const createParameter = async (data: any) => {
  return await prisma.core_Parameter.create({ data });
};

export const updateParameter = async (id: string, data: any) => {
  return await prisma.core_Parameter.update({
    where: { id },
    data
  });
};

export const deleteParameter = async (id: string) => {
  return await prisma.core_Parameter.update({
    where: { id },
    data: { isActive: false }
  });
};
