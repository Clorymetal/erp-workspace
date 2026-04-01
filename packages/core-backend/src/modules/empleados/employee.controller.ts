import { Request, Response } from 'express';
import { EmployeeService } from './employee.service';

export class EmployeeController {
  
  static async getDashboard(req: Request, res: Response) {
    try {
      const year = parseInt(req.query.year as string) || 2026;
      const month = parseInt(req.query.month as string) || 3;
      
      const data = await EmployeeService.getDashboard(year, month);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const year = parseInt(req.query.year as string) || 2026;
      const month = parseInt(req.query.month as string) || 3;
      
      const data = await EmployeeService.getEmployeeDetail(Number(id), year, month);
      if (!data) return res.status(404).json({ success: false, error: "Empleado no encontrado" });
      
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createAdvance(req: Request, res: Response) {
    try {
      const result = await EmployeeService.registerAdvance(req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteAdvance(req: Request, res: Response) {
    try {
      const { advanceId } = req.params;
      await EmployeeService.deleteAdvance(Number(advanceId));
      res.json({ success: true, message: 'Adelanto eliminado y saldos recalculados' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updatePeriodSalary(req: Request, res: Response) {
    try {
      const { periodId } = req.params;
      await EmployeeService.updatePeriodSalary(Number(periodId), req.body);
      res.json({ success: true, message: 'Sueldo actualizado correctamente' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
