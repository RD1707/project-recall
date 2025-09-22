import { Router } from 'express';
import { getSharedDecks } from '@/controllers/shareController';
import { authenticateToken } from '@/middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', getSharedDecks);

export default router;