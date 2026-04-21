import { prisma } from '../../../db';

export const getAllClients = async (search?: string) => {
  const where: any = {};
  
  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: 'insensitive' } },
      { taxId: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } }
    ];
  }

  return await prisma.cli_Client.findMany({
    where,
    orderBy: { businessName: 'asc' }
  });
};

export const getClientById = async (id: string) => {
  return await prisma.cli_Client.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { entryDate: 'desc' },
        take: 10 // Últimas 10 órdenes para vista rápida
      },
      sales: {
        orderBy: { saleDate: 'desc' },
        take: 10
      }
    }
  });
};

export const createClient = async (data: any) => {
  return await prisma.cli_Client.create({
    data: {
      businessName: data.businessName || data.razonSocial,
      taxId: data.taxId || data.cuit,
      email: data.email || null,
      phone: data.phone || data.telefono || null,
      address: data.address || '',
      city: data.city || data.localidad || '',
      taxCondition: data.taxCondition || data.condFisc || 'RI',
      paymentTermsDays: data.paymentTermsDays ? Number(data.paymentTermsDays) : 30
    }
  });
};

export const updateClient = async (id: string, data: any) => {
  return await prisma.cli_Client.update({
    where: { id },
    data: {
      businessName: data.businessName,
      taxId: data.taxId,
      email: data.email,
      phone: data.phone || data.telefono,
      address: data.address,
      city: data.city || data.localidad,
      taxCondition: data.taxCondition,
      paymentTermsDays: data.paymentTermsDays ? Number(data.paymentTermsDays) : undefined
    }
  });
};

export const deleteClient = async (id: string) => {
  const client = await prisma.cli_Client.findUnique({
    where: { id },
    include: {
      orders: true,
      sales: true
    }
  });

  if (!client) throw new Error("Cliente no encontrado");
  
  if (client.orders.length > 0 || client.sales.length > 0) {
    throw new Error("No se puede eliminar un cliente con historial de órdenes o ventas. Debe anularlas primero.");
  }

  return await prisma.cli_Client.delete({
    where: { id }
  });
};

export const getClientBalance = async (clientId: string) => {
  const client = await prisma.cli_Client.findUnique({
    where: { id: clientId },
    include: {
      orders: true,
      sales: true,
      payments: true
    }
  });

  if (!client) return { balance: 0 };

  // Cálculo refinado sumando tareas de órdenes y ventas:
  
  // Refinamos el cálculo:
  const orders = await prisma.repo_Order.findMany({
    where: { clientId, status: { not: 'ANULADO' } },
    include: { tasks: true }
  });

  const sales = await prisma.sale_Order.findMany({
    where: { clientId, status: { not: 'ANULADO' } }
  });

  const payments = await prisma.cli_Payment.findMany({
    where: { clientId, status: 'CONFIRMADO' }
  });

  const totalDebt = orders.reduce((acc, o) => acc + o.tasks.reduce((sum: number, t: any) => sum + t.totalPrice, 0), 0) + 
                    sales.reduce((acc, s) => acc + s.totalAmount, 0);
  
  const totalPaid = payments.reduce((acc, p) => acc + p.totalAmount + (p.discountAmount || 0), 0);

  return {
    clientId,
    balance: totalDebt - totalPaid
  };
};

export const getClientMovementHistory = async (clientId: string) => {
  const orders = await prisma.repo_Order.findMany({
    where: { clientId, status: { not: 'ANULADO' } },
    include: { tasks: true },
    orderBy: { createdAt: 'asc' }
  });

  const sales = await prisma.sale_Order.findMany({
    where: { clientId, status: { not: 'ANULADO' } },
    orderBy: { saleDate: 'asc' }
  });

  const payments = await prisma.cli_Payment.findMany({
    where: { clientId },
    orderBy: { paymentDate: 'asc' }
  });

  const movements: any[] = [];

  orders.forEach(o => {
    const total = o.tasks.reduce((sum: number, t: any) => sum + t.totalPrice, 0);
    movements.push({
      id: o.id,
      date: o.createdAt,
      type: 'TALLER',
      number: `OR-${o.orderNumber}`,
      description: o.pieceSummary || 'Orden de Taller',
      debit: total,
      credit: 0
    });
  });

  sales.forEach(s => {
    movements.push({
      id: s.id,
      date: s.saleDate,
      type: 'VENTA',
      number: s.invoiceNumber || s.remitoNumber || 'S/N',
      description: s.itemsDescription || 'Venta Directa',
      debit: s.totalAmount,
      credit: 0
    });
  });

  payments.forEach(p => {
    const isAnulado = p.status === 'ANULADO';
    movements.push({
      id: p.id,
      date: p.paymentDate,
      type: 'COBRO',
      number: p.number || 'S/N',
      description: isAnulado ? `COBRO ANULADO (${p.paymentMethod})` : `COBRO (${p.paymentMethod})`,
      debit: 0,
      credit: isAnulado ? 0 : p.totalAmount + (p.discountAmount || 0)
    });
  });

  movements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let balance = 0;
  return movements.map(m => {
    balance += (m.debit - m.credit);
    return { ...m, balance };
  });
};
