import { Router } from 'express';
import { getCommunityDecks } from '@/controllers/communityController';
import authMiddleware from '@/middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getCommunityDecks);

export default router;