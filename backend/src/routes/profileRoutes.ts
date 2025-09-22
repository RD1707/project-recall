import { Router, Request, Response } from 'express';
import * as profileController from '../controllers/profileController';
import authMiddleware from '../middleware/authMiddleware';

interface AuthenticatedRequest extends Request {
  user?: { id: string; [key: string]: any };
}

const router = Router();

router.get(
  '/me',
  authMiddleware,
  (req: Request, res: Response) => profileController.getCurrentUserProfile(req as AuthenticatedRequest, res)
);

router.put(
  '/me',
  authMiddleware,
  (req: Request, res: Response) => profileController.updateCurrentUserProfile(req as AuthenticatedRequest, res)
);

router.delete(
  '/me',
  authMiddleware,
  (req: Request, res: Response) => profileController.deleteCurrentUserProfile(req as AuthenticatedRequest, res)
);

router.get(
  '/me/status', 
  authMiddleware, 
  (req: Request, res: Response) => profileController.getProfileStatus(req as AuthenticatedRequest, res)
);

router.get('/:username', profileController.getUserProfileByUsername);

export default router;