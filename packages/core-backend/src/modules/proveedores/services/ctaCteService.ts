import { prisma } from '../../../db';
// Eliminamos importaciones explicitas de tipos de @prisma/client para que TS los infiera desde la DB

export const getMovementHistory = async (providerId: string) => {
  const pid = providerId.trim();
  // 1. Obtener Facturas / Notas de Débito / Notas de Crédito
  const invoices = await prisma.prov_Invoice.findMany({
    where: { providerId: pid },
    orderBy: { issueDate: 'asc' }
  });

  // 2. Obtener Pagos que no sean borradores
  const payments = await prisma.prov_Payment.findMany({
    where: { 
      providerId,
      status: { not: 'BORRADOR' }
    },
    orderBy: { paymentDate: 'asc' }
  });

  // 3. Mezclar y ordenar cronológicamente
  const movements: any[] = [];

  invoices.forEach(inv => {
    const isCredit = inv.invoiceType === 'NOTA_CREDITO';
    movements.push({
      id: inv.id,
      date: inv.issueDate,
      type: inv.invoiceType,
      number: `${inv.pointOfSale}-${inv.invoiceNumber}`,
      description: isCredit ? 'Nota de Crédito' : (inv.invoiceType === 'NOTA_DEBITO' ? 'Nota de Débito' : 'Factura'),
      debit: isCredit ? 0 : inv.totalAmount,
      credit: isCredit ? inv.totalAmount : 0,
      refId: inv.id,
      origin: 'INVOICE'
    });
  });

  payments.forEach(pay => {
    const isAnulado = pay.status === 'ANULADO';
    movements.push({
      id: pay.id,
      date: pay.paymentDate,
      type: 'PAGO',
      number: pay.number || 'S/N',
      description: isAnulado ? `PAGO ANULADO (${pay.paymentMethod})` : `PAGO (${pay.paymentMethod})`,
      debit: 0,
      credit: isAnulado ? 0 : pay.totalAmount + (pay.discountAmount || 0),
      refId: pay.id,
      origin: 'PAYMENT',
      status: pay.status
    });
  });

  // Ordenar por fecha de forma segura y robusta
  movements.sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    if (isNaN(timeA)) return 1;
    if (isNaN(timeB)) return -1;
    return timeA - timeB;
  });

  // 4. Calcular saldo acumulado
  let runningBalance = 0;
  const history = movements.map(m => {
    runningBalance += (m.debit - m.credit);
    return { ...m, balance: runningBalance };
  });

  return history;
};

export const getPendingItems = async (providerId: string) => {
  const pid = providerId.trim();
  // Busca facturas del proveedor sin filtros restrictivos de estado inicialmente para diagnóstico
  const pendingInvoices = await prisma.prov_Invoice.findMany({
    where: {
      providerId: pid
    },
    include: {
      paymentsItems: true
    },
    orderBy: { issueDate: 'asc' }
  });

  // Calculamos el saldo real pendiente de cada factura
  const formattedInvoices = pendingInvoices.map(inv => {
    const paid = (inv.paymentsItems || []).reduce((acc: number, curr: any) => acc + (Number(curr.amountPaid) || 0), 0);
    const total = Number(inv.totalAmount) || 0;
    const pending = total - paid;
    return {
      ...inv,
      amountPaidTotal: paid,
      amountPending: pending
    };
  }).filter(inv => inv.amountPending > 0);

  // Busca saldos a favor (Pagos confirmados que no fueron totalmente aplicados)
  const payments = await prisma.prov_Payment.findMany({
    where: {
      providerId,
      status: 'CONFIRMADO'
    },
    include: {
      invoicesPaid: true
    }
  });

  const availableCredits = payments.map(pay => {
    const applied = pay.invoicesPaid.reduce((acc, curr) => acc + curr.amountPaid, 0);
    const available = pay.totalAmount + (pay.discountAmount || 0) - applied;
    return {
      ...pay,
      amountApplied: applied,
      amountAvailable: available
    };
  }).filter(pay => pay.amountAvailable > 0.01); // Margen por redondeo

  return {
    invoices: formattedInvoices,
    credits: availableCredits
  };
};

export const registerPayment = async (data: any) => {
  const { 
    providerId, 
    paymentDate, 
    totalAmount, 
    paymentMethod, 
    referenceNotes, 
    number,
    discountAmount,
    imputations, // Array de { invoiceId, amount }
    checks // Array de { checkNumber, bankName, issuerName, issueDate, dueDate, amount }
  } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Crear el Pago
    const payment = await tx.prov_Payment.create({
      data: {
        providerId,
        paymentDate: new Date(paymentDate),
        totalAmount: Number(totalAmount),
        paymentMethod,
        referenceNotes,
        number,
        discountAmount: Number(discountAmount || 0),
        status: data.isDraft ? 'BORRADOR' : 'CONFIRMADO',
        checks: checks ? {
          create: checks.map((c: any) => ({
            ...c,
            amount: Number(c.amount),
            issueDate: new Date(c.issueDate),
            dueDate: new Date(c.dueDate)
          }))
        } : undefined
      }
    });

    // 2. Si no es borrador, procesar imputaciones
    if (!data.isDraft && imputations && imputations.length > 0) {
      for (const imp of imputations) {
        // Crear el item de pago
        await tx.prov_PaymentItem.create({
          data: {
            paymentId: payment.id,
            invoiceId: imp.invoiceId,
            amountPaid: Number(imp.amount)
          }
        });

        // Actualizar estado de la factura
        const invoice = await tx.prov_Invoice.findUnique({
          where: { id: imp.invoiceId },
          include: { paymentsItems: true }
        });

        if (invoice) {
          const totalPaid = invoice.paymentsItems.reduce((acc, curr) => acc + curr.amountPaid, 0) + Number(imp.amount);
          let newStatus: InvoiceStatus = 'PAGADA_PARCIAL';
          if (totalPaid >= invoice.totalAmount - 0.01) {
            newStatus = 'PAGADA';
          }
          await tx.prov_Invoice.update({
            where: { id: imp.invoiceId },
            data: { status: newStatus }
          });
        }
      }
    }

    return payment;
  });
};

export const cancelPayment = async (paymentId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Obtener el pago y sus imputaciones
    const payment = await tx.prov_Payment.findUnique({
      where: { id: paymentId },
      include: { invoicesPaid: true }
    });

    if (!payment) throw new Error('Pago no encontrado');
    if (payment.status === 'ANULADO') throw new Error('El pago ya está anulado');

    // 2. Marcar como ANULADO
    await tx.prov_Payment.update({
      where: { id: paymentId },
      data: { status: 'ANULADO' }
    });

    // 3. Revertir estados de facturas
    for (const item of payment.invoicesPaid) {
      const invoiceId = item.invoiceId;
      
      // Borrar la imputación (opcional, o dejarla pero que no sume?)
      // En este caso, si el pago se anula, la imputación deja de existir lógicamente.
      // Pero mejor borrarla para que el cálculo de `getSupplierBalance` sea limpio.
      await tx.prov_PaymentItem.delete({ where: { id: item.id } });

      // Recalcular estado de la factura
      const inv = await tx.prov_Invoice.findUnique({
        where: { id: invoiceId },
        include: { paymentsItems: true }
      });

      if (inv) {
        const totalPaid = inv.paymentsItems.reduce((acc, curr) => acc + curr.amountPaid, 0);
        let newStatus: InvoiceStatus = 'PENDIENTE';
        if (totalPaid > 0) {
          newStatus = 'PAGADA_PARCIAL';
        }
        await tx.prov_Invoice.update({
          where: { id: invoiceId },
          data: { status: newStatus }
        });
      }
    }

    return { success: true };
  });
};

export const getImputationDetails = async (paymentId: string) => {
  return await prisma.prov_Payment.findUnique({
    where: { id: paymentId },
    include: {
      invoicesPaid: {
        include: { invoice: true }
      },
      checks: true,
      provider: true
    }
  });
};
