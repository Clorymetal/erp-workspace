import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // 1. Deuda Total (Suma de facturas no pagadas en proveedores Cta Cte)
    const pendingInvoicesSummary = await prisma.prov_Invoice.aggregate({
      where: {
        status: { not: 'PAGADA' },
        isCtaCte: true
      },
      _sum: {
        totalAmount: true
      }
    });
    const totalDebt = pendingInvoicesSummary._sum.totalAmount || 0;

    // 2. Compras del Mes (Total de facturas en el mes actual)
    const monthlyInvoices = await prisma.prov_Invoice.aggregate({
      where: {
        issueDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        totalAmount: true
      },
      _count: true
    });

    // 3. Vencimientos Próximos (Facturas pendientes que vencen en 7 días)
    const upcomingExpiring = await prisma.prov_Invoice.count({
      where: {
        status: { not: 'PAGADA' },
        dueDate: {
          gte: today,
          lte: nextWeek
        }
      }
    });

    // 4. Últimas Facturas (Top 5)
    const recentInvoices = await prisma.prov_Invoice.findMany({
      take: 5,
      orderBy: { issueDate: 'desc' },
      include: { provider: true }
    });

    // 5. Distribución por Provincia (Proveedores con facturas pendientes)
    const invoicesByProvince = await prisma.prov_Invoice.findMany({
      where: { status: { not: 'PAGADA' } },
      include: { provider: { select: { province: true } } }
    });

    const provinceStatsMap: Record<string, number> = {};
    invoicesByProvince.forEach(inv => {
      const pcia = inv.provider?.province || 'Sin Provincia';
      provinceStatsMap[pcia] = (provinceStatsMap[pcia] || 0) + inv.totalAmount;
    });

    const provinceStats = Object.entries(provinceStatsMap).map(([province, total]) => ({
      province,
      total
    }));

    res.json({
      totalDebt,
      monthlyTotal: monthlyInvoices._sum.totalAmount || 0,
      monthlyCount: monthlyInvoices._count,
      upcomingExpiring,
      recentInvoices,
      provinceStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching dashboard stats' });
  }
};
