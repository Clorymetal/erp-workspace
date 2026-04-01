import { Router } from 'express';
import { listNotifications, updateNotificationReadStatus } from '../controllers/notificationController';

const router = Router();

router.get('/', listNotifications);
router.patch('/:id/read', updateNotificationReadStatus);

export default router;
