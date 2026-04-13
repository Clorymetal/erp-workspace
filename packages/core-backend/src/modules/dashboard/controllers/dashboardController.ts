import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const startOfTwoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const endOfTwoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 1, 0);

    // 1. Deuda Total
    const pendingInvoicesSummary = await prisma.prov_Invoice.aggregate({
      where: {
        status: { not: 'PAGADA' },
        isCtaCte: true
      },
      _sum: { totalAmount: true }
    });
    const totalDebt = pendingInvoicesSummary._sum.totalAmount || 0;

    // 2. Compras del Mes (Actual y anteriores)
    const getMonthlyTotal = async (start: Date, end: Date) => {
      const summary = await prisma.prov_Invoice.aggregate({
        where: { issueDate: { gte: start, lte: end } },
        _sum: { totalAmount: true }
      });
      return summary._sum.totalAmount || 0;
    };

    const currentMonthTotal = await getMonthlyTotal(startOfCurrentMonth, today);
    const lastMonthTotal = await getMonthlyTotal(startOfLastMonth, endOfLastMonth);
    const twoMonthsAgoTotal = await getMonthlyTotal(startOfTwoMonthsAgo, endOfTwoMonthsAgo);

    const monthlyHistory = [
      { month: today.toLocaleString('es-AR', { month: 'long' }), total: currentMonthTotal },
      { month: startOfLastMonth.toLocaleString('es-AR', { month: 'long' }), total: lastMonthTotal },
      { month: startOfTwoMonthsAgo.toLocaleString('es-AR', { month: 'long' }), total: twoMonthsAgoTotal },
    ];

    // 3. Vencimientos (Próximos y Vencidos)
    const expiringSoonAndOverdue = await prisma.prov_Invoice.findMany({
      where: {
        status: { not: 'PAGADA' },
        dueDate: { lte: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000) } // Prox 15 dias + vencidos
      },
      orderBy: { dueDate: 'asc' },
      include: { provider: true }
    });

    // 4. Últimas Compras
    const recentInvoices = await prisma.prov_Invoice.findMany({
      take: 5,
      orderBy: { issueDate: 'desc' },
      include: { provider: true }
    });

    // 5. Tendencia
    const trendValue = lastMonthTotal > 0 
      ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;

    // 6. Datos para gráfico (agrupados por día del mes)
    const getDailyData = async (start: Date, end: Date) => {
      const invoices = await prisma.prov_Invoice.findMany({
        where: { issueDate: { gte: start, lte: end } },
        select: { issueDate: true, totalAmount: true }
      });
      
      const dailyMap: Record<number, number> = {};
      invoices.forEach(inv => {
        const day = new Date(inv.issueDate).getDate();
        dailyMap[day] = (dailyMap[day] || 0) + inv.totalAmount;
      });
      
      return Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        total: dailyMap[i + 1] || 0
      }));
    };

    const currentMonthChart = await getDailyData(startOfCurrentMonth, today);
    const lastMonthChart = await getDailyData(startOfLastMonth, endOfLastMonth);

    res.json({
      totalDebt,
      currentMonthTotal,
      monthlyHistory,
      expiringSoonAndOverdue,
      recentInvoices,
      trend: {
        value: trendValue.toFixed(1),
        comparison: currentMonthTotal >= lastMonthTotal ? 'up' : 'down'
      },
      chartData: {
        current: currentMonthChart,
        previous: lastMonthChart
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching dashboard stats' });
  }
};

