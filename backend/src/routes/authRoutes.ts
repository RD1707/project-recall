import { Router } from 'express';
import * as authController from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Rota para registrar um novo usuário
router.post('/register', authController.register);

// Rota para logar um usuário
router.post('/login', authController.login);

// Rota para deslogar um usuário (protegida, pois precisa saber quem está logando)
router.post('/logout', authMiddleware, authController.logout);

router.post('/request-password-reset', authController.requestPasswordReset);

router.post('/reset-password', authController.resetPassword);

export default router;