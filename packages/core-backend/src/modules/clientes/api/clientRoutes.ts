import { Router } from 'express';
import * as clientController from '../controllers/clientController';

const router = Router();

router.get('/', clientController.getClients);
router.post('/', clientController.createClient);
router.get('/:id', clientController.getClientDetail);
router.patch('/:id', clientController.updateClient);

router.post('/:id/remitos', clientController.createRemito);
router.post('/:id/pagos', clientController.createPayment);

export default router;
