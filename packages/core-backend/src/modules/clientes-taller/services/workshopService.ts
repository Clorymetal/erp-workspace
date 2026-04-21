import { prisma } from '../../../db';
import { OrderStatus, OrderPriority } from '@prisma/client';

export const createOrder = async (data: any) => {
  return await prisma.repo_Order.create({
    data: {
      clientId: data.clientId,
      patent: data.patent || null,
      vehicleBrand: data.vehicleBrand || null,
      pieceSummary: data.pieceSummary || null,
      problemDescription: data.problemDescription || null,
      priority: data.priority || 'NORMAL',
      status: 'INGRESADO',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      tasks: {
        create: (data.tasks || []).map((t: any) => ({
          pieceName: t.pieceName,
          serviceName: t.serviceName,
          mechanicId: t.mechanicId ? Number(t.mechanicId) : null,
          laborPrice: Number(t.laborPrice || 0),
          partsCost: Number(t.partsCost || 0),
          totalPrice: Number(t.laborPrice || 0) + Number(t.partsCost || 0)
        }))
      }
    },
    include: {
      tasks: true,
      client: true
    }
  });
};

export const getOrders = async (filters: any) => {
  const { status, mechanicId, patent, search } = filters;
  
  const where: any = {};
  
  if (status && status !== 'ALL') where.status = status;
  if (mechanicId) where.tasks = { some: { mechanicId: Number(mechanicId) } };
  if (patent) where.patent = { contains: patent, mode: 'insensitive' };
  
  if (search) {
    where.OR = [
      { client: { businessName: { contains: search, mode: 'insensitive' } } },
      { patent: { contains: search, mode: 'insensitive' } },
      { pieceSummary: { contains: search, mode: 'insensitive' } }
    ];
  }

  return await prisma.repo_Order.findMany({
    where,
    include: {
      client: true,
      tasks: {
        include: { mechanic: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const data: any = { status };
  
  if (status === 'LISTO') data.finishDate = new Date();
  if (status === 'ENTREGADO') data.deliveryDate = new Date();

  return await prisma.repo_Order.update({
    where: { id },
    data
  });
};

export const getOrderById = async (id: string) => {
  return await prisma.repo_Order.findUnique({
    where: { id },
    include: {
      client: true,
      tasks: {
        include: { mechanic: true }
      }
    }
  });
};

export const updateTaskStatus = async (taskId: string, isCompleted: boolean) => {
  return await prisma.repo_Task.update({
    where: { id: taskId },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null
    }
  });
};

export const updateOrder = async (id: string, data: any) => {
  // Primero eliminamos las tareas actuales y las recreamos para simplificar el update complejo
  return await prisma.$transaction(async (tx) => {
    // Eliminar tareas viejas
    await tx.repo_Task.deleteMany({ where: { orderId: id } });

    // Actualizar orden y crear nuevas tareas
    return await tx.repo_Order.update({
      where: { id },
      data: {
        patent: data.patent || null,
        vehicleBrand: data.vehicleBrand || null,
        pieceSummary: data.pieceSummary || null,
        problemDescription: data.problemDescription || null,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        tasks: {
          create: (data.tasks || []).map((t: any) => ({
            pieceName: t.pieceName,
            serviceName: t.serviceName,
            mechanicId: t.mechanicId ? Number(t.mechanicId) : null,
            laborPrice: Number(t.laborPrice || 0),
            partsCost: Number(t.partsCost || 0),
            totalPrice: Number(t.laborPrice || 0) + Number(t.partsCost || 0)
          }))
        }
      },
      include: {
        tasks: true,
        client: true
      }
    });
  });
};

export const deleteOrder = async (id: string) => {
  return await prisma.repo_Order.delete({
    where: { id }
  });
};
