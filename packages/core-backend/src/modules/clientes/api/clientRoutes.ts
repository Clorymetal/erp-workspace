import { Router } from 'express';
import * as clientController from '../controllers/clientController';

const router = Router();

// Rutas estáticas primero (deben ir ANTES de las rutas con parámetros dinámicos)
router.patch('/remitos/:remitoId', clientController.updateRemito);
router.delete('/remitos/:remitoId', clientController.deleteRemito);

router.patch('/pagos/:paymentId', clientController.updatePayment);
router.delete('/pagos/:paymentId', clientController.deletePayment);

// Rutas de colección
router.get('/', clientController.getClients);
router.post('/', clientController.createClient);

// Rutas con parámetro dinámico /:id al final
router.get('/:id', clientController.getClientDetail);
router.patch('/:id', clientController.updateClient);

router.post('/:id/remitos', clientController.createRemito);
router.post('/:id/pagos', clientController.createPayment);

export default router;
