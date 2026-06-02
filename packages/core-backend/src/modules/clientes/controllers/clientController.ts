import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await prisma.cli_Client.findMany({
      include: {
        remitos: true,
        payments: true
      },
      orderBy: { businessName: 'asc' }
    });

    const today = new Date();
    const in5Days = new Date();
    in5Days.setDate(today.getDate() + 5);

    const clientsWithBalance = clients.map(client => {
      const totalDebt = client.remitos.reduce((acc, rem) => acc + rem.totalAmount, 0);
      const totalPaid = client.payments
        .filter(p => p.status === 'CONFIRMADO')
        .reduce((acc, p) => acc + p.totalAmount, 0);
      const balance = totalDebt - totalPaid;

      // Calcular estado de vencimiento basado en remitos pendientes
      const pendingRemitos = client.remitos
        .filter(r => ['PENDIENTE', 'PARCIAL', 'VENCIDO'].includes(r.status))
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      let dueStatus = 'AL_DIA';
      let nextDueDate: Date | null = null;

      if (pendingRemitos.length > 0) {
        nextDueDate = new Date(pendingRemitos[0].dueDate);
        if (nextDueDate < today) {
          dueStatus = 'VENCIDO';
        } else if (nextDueDate <= in5Days) {
          dueStatus = 'PROXIMO';
        }
      }

      return { ...client, balance, dueStatus, nextDueDate };
    });

    res.json(clientsWithBalance);
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newClient = await prisma.cli_Client.create({
      data: req.body
    });
    res.status(201).json(newClient);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedClient = await prisma.cli_Client.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(updatedClient);
  } catch (error) {
    next(error);
  }
};

export const getClientDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const client = await prisma.cli_Client.findUnique({
      where: { id },
      include: {
        remitos: { orderBy: { date: 'desc' } },
        payments: { orderBy: { paymentDate: 'desc' }, include: { imputations: true } }
      }
    });
    
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });

    const totalDebt = client.remitos.reduce((acc, rem) => acc + rem.totalAmount, 0);
    const totalPaid = client.payments.filter(p => p.status === 'CONFIRMADO').reduce((acc, p) => acc + p.totalAmount, 0);
    const balance = totalDebt - totalPaid;

    res.json({ ...client, balance });
  } catch (error) {
    next(error);
  }
};

export const createRemito = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // client id
    const data = req.body;

    // Obtener el cliente para ver su tipo de facturación
    const client = await prisma.cli_Client.findUnique({ where: { id } });
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });

    const dateObj = new Date(data.date || new Date());
    let dueDate: Date;

    if (client.billingCycle === 'MENSUAL') {
      // Vence el 1° del mes siguiente a la fecha del trabajo
      dueDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 1);
    } else {
      // POR_REMITO: sumar los días de plazo otorgados
      const days = parseInt(data.paymentTermDays || String(client.paymentTermsDays) || '30', 10);
      dueDate = new Date(dateObj);
      dueDate.setDate(dueDate.getDate() + days);
    }

    const remito = await prisma.cli_Remito.create({
      data: {
        clientId: id,
        date: dateObj,
        dueDate: dueDate,
        totalAmount: parseFloat(data.totalAmount),
        driverName: data.driverName,
        driverDni: data.driverDni,
        driverPhone: data.driverPhone,
        status: 'PENDIENTE',
        paymentTermDays: client.billingCycle === 'MENSUAL' ? 0 : parseInt(data.paymentTermDays || '30', 10),
        documentType: data.documentType || 'Remito',
        invoiceNumber: data.invoiceNumber
      }
    });
    res.status(201).json(remito);
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // client id
    const { amount, paymentMethod, referenceNotes } = req.body;
    const paymentAmount = parseFloat(amount);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el pago general
      const payment = await tx.cli_Payment.create({
        data: {
          clientId: id,
          totalAmount: paymentAmount,
          paymentMethod: paymentMethod || 'EFECTIVO',
          referenceNotes,
          status: 'CONFIRMADO'
        }
      });

      // 2. Traer remitos pendientes (status PENDIENTE o PARCIAL) ordenados por el más viejo (FIFO)
      const remitos = await tx.cli_Remito.findMany({
        where: {
          clientId: id,
          status: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] }
        },
        orderBy: { date: 'asc' },
        include: { imputations: true }
      });

      let remainingAmount = paymentAmount;

      for (const rem of remitos) {
        if (remainingAmount <= 0) break;

        const alreadyPaid = rem.imputations.reduce((acc, imp) => acc + imp.amountPaid, 0);
        const debtForThisRemito = rem.totalAmount - alreadyPaid;

        if (debtForThisRemito <= 0) continue; // Por seguridad

        const amountToImpute = Math.min(debtForThisRemito, remainingAmount);

        // Crear la imputación
        await tx.cli_PaymentItem.create({
          data: {
            paymentId: payment.id,
            remitoId: rem.id,
            amountPaid: amountToImpute
          }
        });

        remainingAmount -= amountToImpute;

        // Actualizar el estado del remito
        const newAlreadyPaid = alreadyPaid + amountToImpute;
        let newStatus = 'PARCIAL';
        if (newAlreadyPaid >= rem.totalAmount) {
          newStatus = 'COBRADO';
        }

        await tx.cli_Remito.update({
          where: { id: rem.id },
          data: { status: newStatus }
        });
      }

      return payment;
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateRemito = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { remitoId } = req.params;
    const data = req.body;
    
    const remito = await prisma.cli_Remito.findUnique({
      where: { id: remitoId },
      include: { imputations: true }
    });

    if (!remito) return res.status(404).json({ message: 'Remito no encontrado' });

    let status = remito.status;
    const alreadyPaid = remito.imputations.reduce((acc, imp) => acc + imp.amountPaid, 0);
    const newTotalAmount = data.totalAmount !== undefined ? parseFloat(data.totalAmount) : remito.totalAmount;

    if (alreadyPaid >= newTotalAmount && newTotalAmount > 0) {
      status = 'COBRADO';
    } else if (alreadyPaid > 0 && alreadyPaid < newTotalAmount) {
      status = 'PARCIAL';
    } else {
      status = 'PENDIENTE';
    }

    const updated = await prisma.cli_Remito.update({
      where: { id: remitoId },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        totalAmount: newTotalAmount,
        invoiceNumber: data.invoiceNumber !== undefined ? data.invoiceNumber : undefined,
        driverName: data.driverName !== undefined ? data.driverName : undefined,
        driverDni: data.driverDni !== undefined ? data.driverDni : undefined,
        driverPhone: data.driverPhone !== undefined ? data.driverPhone : undefined,
        documentType: data.documentType !== undefined ? data.documentType : undefined,
        status
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteRemito = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { remitoId } = req.params;
    
    const remito = await prisma.cli_Remito.findUnique({
      where: { id: remitoId },
      include: { imputations: true }
    });

    if (!remito) return res.status(404).json({ message: 'Remito no encontrado' });

    if (remito.imputations.length > 0) {
      return res.status(400).json({ 
        message: 'No se puede borrar el remito porque tiene pagos asociados. Borre los pagos primero.' 
      });
    }

    await prisma.cli_Remito.delete({
      where: { id: remitoId }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const { paymentDate, paymentMethod, referenceNotes } = req.body;

    const updated = await prisma.cli_Payment.update({
      where: { id: paymentId },
      data: {
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : undefined,
        referenceNotes: referenceNotes !== undefined ? referenceNotes : undefined
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deletePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;

    await prisma.$transaction(async (tx) => {
      const paymentItems = await tx.cli_PaymentItem.findMany({
        where: { paymentId }
      });

      const remitosAfectadosIds = [...new Set(paymentItems.map(i => i.remitoId).filter(Boolean))] as string[];

      await tx.cli_Payment.delete({
        where: { id: paymentId }
      });

      for (const rId of remitosAfectadosIds) {
        const remito = await tx.cli_Remito.findUnique({
          where: { id: rId },
          include: { imputations: true }
        });

        if (remito) {
          const stillPaid = remito.imputations.reduce((acc, imp) => acc + imp.amountPaid, 0);
          let newStatus = 'PENDIENTE';
          if (stillPaid >= remito.totalAmount && remito.totalAmount > 0) {
            newStatus = 'COBRADO';
          } else if (stillPaid > 0) {
            newStatus = 'PARCIAL';
          }

          await tx.cli_Remito.update({
            where: { id: rId },
            data: { status: newStatus }
          });
        }
      }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
