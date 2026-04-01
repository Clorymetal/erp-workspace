import { prisma } from '../../../db';
import { InvoiceStatus } from '@prisma/client';

export const getSupplierBalance = async (providerId: string) => {
  // Verificamos si es un proveedor de Cuenta Corriente
  const provider = await prisma.prov_Provider.findUnique({ 
    where: { id: providerId },
    select: { isCtaCte: true }
  });

  if (!provider || !provider.isCtaCte) {
    return { providerId, balance: 0 };
  }

  // Calculamos la deuda sumando las facturas pendientes o pagadas parcialmente
  const invoices = await prisma.prov_Invoice.findMany({
    where: {
      providerId,
      status: {
        in: ['PENDIENTE', 'PAGADA_PARCIAL', 'VENCIDA']
      }
    },
    include: {
      paymentsItems: true
    }
  });

  let totalDebt = 0;
  
  invoices.forEach((inv: any) => {
    const paidSoFar = inv.paymentsItems.reduce((acc: number, current: any) => acc + current.amountPaid, 0);
    const remaining = inv.totalAmount - paidSoFar;
    
    if (inv.invoiceType === 'NOTA_CREDITO') {
      totalDebt -= remaining;
    } else {
      totalDebt += remaining;
    }
  });

  return {
    providerId,
    balance: totalDebt
  };
};

export const createInvoice = async (providerId: string, data: any) => {
  return await prisma.prov_Invoice.create({
    data: {
      providerId,
      invoiceType: data.invoiceType || 'FACTURA_A',
      pointOfSale: data.pointOfSale,
      invoiceNumber: data.invoiceNumber,
      issueDate: new Date(data.issueDate),
      receptionDate: data.receptionDate ? new Date(data.receptionDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      netAmount: Number(data.netAmount || 0),
      taxAmount: Number(data.taxAmount || 0),
      perceptionAmount: Number(data.perceptionAmount || 0),
      nonTaxedAmount: Number(data.nonTaxedAmount || 0),
      totalAmount: Number(data.totalAmount || 0),
      isCtaCte: data.isCtaCte ?? true,
      status: data.status || 'PENDIENTE'
    }
  });
};

export const updateInvoice = async (invoiceId: string, data: any) => {
  return await prisma.prov_Invoice.update({
    where: { id: invoiceId },
    data: {
      invoiceType: data.invoiceType,
      pointOfSale: data.pointOfSale,
      invoiceNumber: data.invoiceNumber,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      netAmount: data.netAmount !== undefined ? Number(data.netAmount) : undefined,
      taxAmount: data.taxAmount !== undefined ? Number(data.taxAmount) : undefined,
      perceptionAmount: data.perceptionAmount !== undefined ? Number(data.perceptionAmount) : undefined,
      nonTaxedAmount: data.nonTaxedAmount !== undefined ? Number(data.nonTaxedAmount) : undefined,
      totalAmount: data.totalAmount !== undefined ? Number(data.totalAmount) : undefined,
      status: data.status,
      isCtaCte: data.isCtaCte
    }
  });
};

export const updateProvider = async (id: string, data: any) => {
  return await prisma.prov_Provider.update({
    where: { id },
    data: {
      businessName: data.razonSocial,
      taxId: data.cuit,
      province: data.provincia,
      postalCode: data.cp,
      taxCondition: data.condFisc,
      isCtaCte: data.isCtaCte,
      contacts: data.email || data.telefono ? {
        updateMany: {
          where: {},
          data: {
            email: data.email,
            phone: data.telefono
          }
        }
      } : undefined
    }
  });
};

export const createProvider = async (data: any) => {
  return await prisma.prov_Provider.create({
    data: {
      businessName: data.businessName || data.razonSocial,
      taxId: data.taxId || data.cuit,
      address: data.address || '',
      postalCode: data.postalCode || data.cp || '',
      province: data.province || data.pcia || '',
      taxCondition: data.taxCondition || data.condFisc || '',
      isCtaCte: data.isCtaCte ?? true,
      contacts: {
        create: {
          name: 'Principal',
          email: data.email || '',
          phone: data.phone || data.telefono || ''
        }
      }
    },
    include: {
      contacts: true
    }
  });
};

export const getAllInvoices = async (filters: any) => {
  const { startDate, endDate, status, isCtaCte, province, providerId } = filters;
  
  const where: any = {};
  
  if (startDate || endDate) {
    where.issueDate = {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined
    };
  }
  
  if (status && status !== 'ALL') where.status = status;
  if (isCtaCte !== undefined) where.isCtaCte = isCtaCte === 'true' ? true : (isCtaCte === 'false' ? false : undefined);
  if (providerId) where.providerId = providerId;
  
  if (province && province !== 'ALL') {
    where.provider = { province };
  }

  return await prisma.prov_Invoice.findMany({
    where,
    include: {
      provider: true,
      paymentsItems: true
    },
    orderBy: { issueDate: 'desc' }
  });
};
