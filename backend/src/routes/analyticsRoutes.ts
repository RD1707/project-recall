import { Router } from 'express';
import { getAnalytics } from '@/controllers/analyticsController';
import authMiddleware from '@/middleware/authMiddleware'; // Corrigido: Importação padrão

const router = Router();

router.use(authMiddleware);

router.get('/', getAnalytics);

export default router;