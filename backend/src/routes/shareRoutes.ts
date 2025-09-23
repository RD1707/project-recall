import { Router } from 'express';
import { getSharedDecks } from '@/controllers/shareController';
import authMiddleware from '@/middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getSharedDecks);

export default router;