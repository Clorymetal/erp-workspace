import { Router } from 'express';
import { googleLogin, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint público para recibir login de Google
router.post('/google', googleLogin);

// Endpoint privado para obtener perfil del usuario actual
router.get('/me', authMiddleware, getCurrentUser);

export default router;
