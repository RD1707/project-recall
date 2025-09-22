import { Router } from 'express';
import {
  getAchievements,
  getAchievementStats,
  recalculateAchievements,
  forceRecalculate,
} from '@/controllers/achievementController';
import { authenticateToken } from '@/middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/achievements - Get all achievements with user progress
router.get('/', getAchievements);

// GET /api/achievements/stats - Get achievement statistics
router.get('/stats', getAchievementStats);

// POST /api/achievements/recalculate - Recalculate achievements for current user
router.post('/recalculate', recalculateAchievements);

// POST /api/achievements/force-recalculate - Force recalculate (admin/maintenance)
router.post('/force-recalculate', forceRecalculate);

export default router;