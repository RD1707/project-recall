import { Router } from 'express';
import { getAnalytics } from '@/controllers/analyticsController';
import { authenticateToken } from '@/middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', getAnalytics);

export default router;