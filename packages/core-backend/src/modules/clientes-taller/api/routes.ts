import { Router } from 'express';
import * as clientController from '../controllers/clientController';

const router = Router();

// Rutas de Gestión de Clientes (Cli_Client)
router.get('/clientes', clientController.getClients);
router.get('/clientes/:id', clientController.getClientById);
router.post('/clientes', clientController.createClient);
router.put('/clientes/:id', clientController.updateClient);
router.delete('/clientes/:id', clientController.deleteClient);
router.get('/clientes/:id/balance', clientController.getClientBalance);
router.get('/clientes/:id/cta-cte', clientController.getClientCtaCte);

// Rutas de Órdenes de Reparación (Repo_Order)
import * as workshopController from '../controllers/workshopController';

router.get('/orders', workshopController.getOrders);
router.get('/orders/:id', workshopController.getOrderById);
router.post('/orders', workshopController.createOrder);
router.put('/orders/:id/status', workshopController.updateOrderStatus);
router.put('/orders/:id', workshopController.updateOrder);
router.delete('/orders/:id', workshopController.deleteOrder);
router.put('/tasks/:id/status', workshopController.updateTaskStatus);

export default router;
