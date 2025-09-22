import { Router } from 'express';
import {
  getAchievements,
  getAchievementStats,
  recalculateAchievements,
  forceRecalculate,
} from '@/controllers/achievementController';
import { authenticateToken } from '@/middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getAchievements);

router.get('/stats', getAchievementStats);

router.post('/recalculate', recalculateAchievements);

router.post('/force-recalculate', forceRecalculate);

export default router;