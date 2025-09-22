import { Router } from 'express';
import { getCommunityDecks } from '@/controllers/communityController';
import { authenticateToken } from '@/middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', getCommunityDecks);

export default router;