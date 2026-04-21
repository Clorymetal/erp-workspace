import { prisma } from '../../../db';
import { InvoiceStatus } from '@prisma/client';

export const getSupplierBalance = async (providerId: string) => {
  const provider = await prisma.prov_Provider.findUnique({ 
    where: { id: providerId },
    select: { isCtaCte: true }
  });

  if (!provider || !provider.isCtaCte) {
    return { providerId, balance: 0 };
  }

  // 1. Débitos: Todas las Facturas y Notas de Débito
  const invoices = await prisma.prov_Invoice.findMany({
    where: { 
      providerId,
      invoiceType: { in: ['FACTURA_A', 'FACTURA_B', 'FACTURA_C', 'NOTA_DEBITO'] }
    }
  });

  // 2. Créditos (Documentos): Notas de Crédito
  const creditNotes = await prisma.prov_Invoice.findMany({
    where: { 
      providerId,
      invoiceType: 'NOTA_CREDITO'
    }
  });

  // 3. Créditos (Pagos): Pagos Confirmados + sus Ajustes
  const payments = await prisma.prov_Payment.findMany({
    where: { 
      providerId, 
      status: 'CONFIRMADO' 
    }
  });

  const totalDebits = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalCreditNotes = creditNotes.reduce((acc, cn) => acc + cn.totalAmount, 0);
  const totalPayments = payments.reduce((acc, pay) => acc + pay.totalAmount + (pay.discountAmount || 0), 0);

  return {
    providerId,
    balance: totalDebits - totalCreditNotes - totalPayments
  };
};

export const createInvoice = async (providerId: string, data: any) => {
  let dueDate = data.dueDate ? new Date(data.dueDate + 'T12:00:00') : null;
  
  if (!dueDate) {
    const provider = await prisma.prov_Provider.findUnique({ 
      where: { id: providerId },
      select: { expirationDays: true }
    });
    if (provider && provider.expirationDays > 0) {
      const issueDate = new Date(data.issueDate + 'T12:00:00');
      dueDate = new Date(issueDate.getTime() + provider.expirationDays * 24 * 60 * 60 * 1000);
    }
  }

  return await prisma.prov_Invoice.create({
    data: {
      providerId,
      invoiceType: data.invoiceType || 'FACTURA_A',
      pointOfSale: data.pointOfSale,
      invoiceNumber: data.invoiceNumber,
      issueDate: new Date(data.issueDate + 'T12:00:00'),
      receptionDate: data.receptionDate ? new Date(data.receptionDate + 'T12:00:00') : new Date(),
      dueDate,
      netAmount: Number(data.netAmount || 0),
      taxAmount: Number(data.taxAmount || 0),
      perceptionAmount: Number(data.perceptionAmount || 0),
      nonTaxedAmount: Number(data.nonTaxedAmount || 0),
      totalAmount: Number(data.totalAmount || 0),
      isCtaCte: data.isCtaCte ?? true,
      status: data.status || 'PENDIENTE',
      ivaPeriod: data.ivaPeriod || `${new Date(data.issueDate).getFullYear()}-${String(new Date(data.issueDate).getMonth() + 1).padStart(2, '0')}`,
      ivaNumber: data.ivaNumber ? Number(data.ivaNumber) : null
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
      issueDate: data.issueDate ? new Date(data.issueDate + 'T12:00:00') : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate + 'T12:00:00') : undefined,
      netAmount: data.netAmount !== undefined ? Number(data.netAmount) : undefined,
      taxAmount: data.taxAmount !== undefined ? Number(data.taxAmount) : undefined,
      perceptionAmount: data.perceptionAmount !== undefined ? Number(data.perceptionAmount) : undefined,
      nonTaxedAmount: data.nonTaxedAmount !== undefined ? Number(data.nonTaxedAmount) : undefined,
      totalAmount: data.totalAmount !== undefined ? Number(data.totalAmount) : undefined,
      status: data.status,
      isCtaCte: data.isCtaCte,
      ivaPeriod: data.ivaPeriod,
      ivaNumber: data.ivaNumber !== undefined ? (data.ivaNumber === null ? null : Number(data.ivaNumber)) : undefined
    }
  });
};

export const updateProvider = async (id: string, data: any) => {
  return await prisma.prov_Provider.update({
    where: { id },
    data: {
      businessName: data.razonSocial || data.businessName,
      taxId: data.cuit || data.taxId,
      province: data.provincia || data.province,
      postalCode: data.cp || data.postalCode,
      taxCondition: data.condFisc || data.taxCondition,
      isCtaCte: data.isCtaCte,
      expirationDays: data.expirationDays ? Number(data.expirationDays) : undefined,
      netAmountCode: data.netAmountCode,
      fantasyName: data.nombreFantasia || data.fantasyName,
      contacts: data.email || data.telefono || data.phone ? {
        updateMany: {
          where: {},
          data: {
            email: data.email,
            phone: data.telefono || data.phone
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
      expirationDays: data.expirationDays ? Number(data.expirationDays) : 0,
      netAmountCode: data.netAmountCode || null,
      fantasyName: data.nombreFantasia || data.fantasyName,
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
  const { startDate, endDate, status, isCtaCte, province, providerId, ivaPeriod, search } = filters;
  
  const where: any = {};
  
  if (startDate || endDate) {
    where.issueDate = {
      gte: startDate ? new Date(startDate + 'T00:00:00') : undefined,
      lte: endDate ? new Date(endDate + 'T23:59:59') : undefined
    };
  }
  
  if (status && status !== 'ALL') {
    if (status === 'PENDIENTE') {
      where.status = { in: ['PENDIENTE', 'PAGADA_PARCIAL', 'VENCIDA'] };
    } else {
      where.status = status;
    }
  }
  if (isCtaCte !== undefined) where.isCtaCte = isCtaCte === 'true' ? true : (isCtaCte === 'false' ? false : undefined);
  if (providerId) where.providerId = providerId;
  
  if (province && province !== 'ALL') {
    where.provider = { province };
  }

  if (ivaPeriod && ivaPeriod !== 'ALL') {
    where.ivaPeriod = ivaPeriod;
  }

  if (search) {
    where.OR = [
      { provider: { businessName: { contains: search, mode: 'insensitive' } } },
      { provider: { fantasyName: { contains: search, mode: 'insensitive' } } },
      { provider: { taxId: { contains: search, mode: 'insensitive' } } },
      { invoiceNumber: { contains: search, mode: 'insensitive' } }
    ];
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

export const deleteInvoice = async (invoiceId: string) => {
  const invoice = await prisma.prov_Invoice.findUnique({
    where: { id: invoiceId },
    include: { paymentsItems: true }
  });

  if (!invoice) throw new Error("Factura no encontrada");
  if (invoice.paymentsItems.length > 0) {
    throw new Error("No se puede eliminar una factura que ya tiene pagos asociados. Debe anular los pagos primero.");
  }

  return await prisma.prov_Invoice.delete({
    where: { id: invoiceId }
  });
};

export const deleteProvider = async (id: string) => {
  const provider = await prisma.prov_Provider.findUnique({
    where: { id },
    include: { invoices: true, payments: true }
  });

  if (!provider) throw new Error("Proveedor no encontrado");
  
  if (provider.invoices.length > 0) {
    throw new Error("No se puede eliminar un proveedor con facturas (incluso de contado). Debe eliminar las facturas primero.");
  }

  const hasActivePayments = provider.payments.some(p => p.status === 'CONFIRMADO');
  if (hasActivePayments) {
    throw new Error("No se puede eliminar un proveedor con pagos confirmados. Anule los pagos primero.");
  }

  return await prisma.$transaction(async (tx) => {
    const paymentIds = provider.payments.map(p => p.id);
    
    // Limpiar dependencias de pagos
    await tx.prov_PaymentItem.deleteMany({ where: { paymentId: { in: paymentIds } } });
    await tx.prov_Check.deleteMany({ where: { paymentId: { in: paymentIds } } });
    await tx.prov_Payment.deleteMany({ where: { providerId: id } });
    
    // Limpiar contactos y bancos
    await tx.prov_Contact.deleteMany({ where: { providerId: id } });
    await tx.prov_BankAccount.deleteMany({ where: { providerId: id } });

    return await tx.prov_Provider.delete({ where: { id } });
  });
};


