import { Router } from 'express';
import {
  getAchievements,
  getAchievementStats,
  recalculateAchievements,
  forceRecalculate,
} from '@/controllers/achievementController';
import authMiddleware from '@/middleware/authMiddleware'; // Corrigido: Importação padrão

const router = Router();

// Aplica o middleware de autenticação a todas as rotas neste ficheiro
router.use(authMiddleware);

router.get('/', getAchievements);

router.get('/stats', getAchievementStats);

router.post('/recalculate', recalculateAchievements);

// Rota de administrador/desenvolvimento para forçar o recálculo
router.post('/force-recalculate', forceRecalculate);

export default router;