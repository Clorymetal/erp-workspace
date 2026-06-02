import { Router } from 'express';
import * as clientController from '../controllers/clientController';

const router = Router();

router.get('/', clientController.getClients);
router.post('/', clientController.createClient);
router.get('/:id', clientController.getClientDetail);
router.patch('/:id', clientController.updateClient);

router.post('/:id/remitos', clientController.createRemito);
router.patch('/remitos/:remitoId', clientController.updateRemito);
router.delete('/remitos/:remitoId', clientController.deleteRemito);

router.post('/:id/pagos', clientController.createPayment);
router.patch('/pagos/:paymentId', clientController.updatePayment);
router.delete('/pagos/:paymentId', clientController.deletePayment);

export default router;
