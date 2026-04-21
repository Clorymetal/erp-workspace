import { Router } from 'express';
import * as configController from './config.controller';

const router = Router();

router.get('/business', configController.getBusinessConfig);
router.put('/business', configController.updateBusinessConfig);

export default router;
