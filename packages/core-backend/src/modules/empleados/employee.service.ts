import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EmployeeService {
  
  // 1. Obtener panel principal y Auto-generar periodos faltantes
  static async getDashboard(year: number, month: number) {
    const employees = await prisma.emp_Employee.findMany({
      where: { isActive: true },
      include: {
        salaryPeriods: {
          where: { periodYear: year, periodMonth: month }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Validar y auto-crear periodos de sueldo si no existen para este mes
    for (const emp of employees) {
      if (emp.salaryPeriods.length === 0) {
        const isBiWeekly = emp.payType === 'BIWEEKLY';
        const halfSalary = Math.round(emp.baseSalary / 2);

        const newPeriod = await prisma.emp_SalaryPeriod.create({
          data: {
            employeeId: emp.id,
            periodYear: year,
            periodMonth: month,
            baseSalary: emp.baseSalary,
            firstInstallment: isBiWeekly ? halfSalary : null,
            secondInstallment: isBiWeekly ? emp.baseSalary - halfSalary : null,
            totalAdvances: 0,
            balance: emp.baseSalary,
            isClosed: false
          }
        });
        emp.salaryPeriods.push(newPeriod as any);
      }
    }

    return employees;
  }

  // 2. Obtener detalle de 1 empleado y sus adelantos del mes
  static async getEmployeeDetail(employeeId: number, year: number, month: number) {
    return prisma.emp_Employee.findUnique({
      where: { id: employeeId },
      include: {
        salaryPeriods: {
          where: { periodYear: year, periodMonth: month },
          include: {
            advances: {
              orderBy: { date: 'asc' }
            }
          }
        }
      }
    });
  }

  // 3. Método auxiliar para garantizar cálculos perfectos
  static async recalculateSalaryPeriod(periodId: number, tx: any) {
    const period = await tx.emp_SalaryPeriod.findUnique({ where: { id: periodId } });
    if (!period) return;
    
    const advances = await tx.emp_Advance.findMany({
      where: { periodId },
      orderBy: { date: 'asc' }
    });
    
    let runningAccumulated = 0;
    for (const adv of advances) {
      runningAccumulated += adv.totalAmount;
      await tx.emp_Advance.update({
        where: { id: adv.id },
        data: {
          accumulated: runningAccumulated,
          balance: period.baseSalary - runningAccumulated
        }
      });
    }
    
    await tx.emp_SalaryPeriod.update({
      where: { id: period.id },
      data: {
        totalAdvances: runningAccumulated,
        balance: period.baseSalary - runningAccumulated
      }
    });
  }

  // 4. Registrar un anticipo con Recálculo Histórico Obligatorio
  static async registerAdvance(data: { employeeId: number; periodId: number; date: string; cashAmount: number; transferAmount: number; checkAmount: number; notes?: string }) {
    const { employeeId, periodId, date, cashAmount, transferAmount, checkAmount, notes } = data;
    const totalAmount = cashAmount + transferAmount + checkAmount;

    return prisma.$transaction(async (tx) => {
      await tx.emp_Advance.create({
        data: {
          employeeId,
          periodId,
          date: new Date(date + 'T12:00:00'),
          cashAmount,
          transferAmount,
          checkAmount,
          totalAmount,
          accumulated: 0, // Será sobreescrito casi de inmediato
          balance: 0,     // Será sobreescrito casi de inmediato
          notes
        }
      });
      await EmployeeService.recalculateSalaryPeriod(periodId, tx);
    });
  }

  // 5. Eliminar un Anticipo
  static async deleteAdvance(advanceId: number) {
    const advance = await prisma.emp_Advance.findUnique({ where: { id: advanceId } });
    if (!advance) throw new Error('Adelanto no encontrado');

    return prisma.$transaction(async (tx) => {
      await tx.emp_Advance.delete({ where: { id: advanceId } });
      await EmployeeService.recalculateSalaryPeriod(advance.periodId, tx);
    });
  }

  // 6. Actualizar Sueldo Base de un Periodo
  static async updatePeriodSalary(periodId: number, data: { salary: number; firstInstallment?: number; secondInstallment?: number }) {
    const { salary, firstInstallment, secondInstallment } = data;
    
    return prisma.$transaction(async (tx) => {
      const period = await tx.emp_SalaryPeriod.findUnique({
        where: { id: periodId },
        include: { employee: true }
      });
      if (!period) throw new Error("Period not found");

      const isBiWeekly = period.employee.payType === 'BIWEEKLY';
      
      // Si es quincenal y no se pasaron montos especificos, hacemos el 50/50 por defecto
      const finalFirst = isBiWeekly ? (firstInstallment ?? Math.round(salary / 2)) : null;
      const finalSecond = isBiWeekly ? (secondInstallment ?? (salary - (finalFirst || 0))) : null;

      // 1. Actualiza el empleado para que los proximos meses tomen este nuevo sueldo de referencia
      await tx.emp_Employee.update({
        where: { id: period.employeeId },
        data: { baseSalary: salary }
      });

      // 2. Actualiza los montos del periodo actual
      await tx.emp_SalaryPeriod.update({
        where: { id: periodId },
        data: {
          baseSalary: salary,
          firstInstallment: finalFirst,
          secondInstallment: finalSecond
        }
      });

      // 3. Recalcula el saldo disponible
      await EmployeeService.recalculateSalaryPeriod(periodId, tx);
    });
  }
}
