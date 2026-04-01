import { Router } from 'express';
import { EmployeeController } from './employee.controller';

const router = Router();

router.get('/dashboard', EmployeeController.getDashboard);
router.get('/:id/detail', EmployeeController.getDetail);
router.post('/advance', EmployeeController.createAdvance);
router.delete('/advance/:advanceId', EmployeeController.deleteAdvance);
router.put('/period/:periodId/salary', EmployeeController.updatePeriodSalary);

export default router;
