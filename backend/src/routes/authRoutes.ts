import { Router } from 'express';
import * as authController from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', authMiddleware, authController.logout);

router.post('/request-password-reset', authController.requestPasswordReset);

router.post('/reset-password', authController.resetPassword);

export default router;