import { Router, Request, Response } from 'express';
import * as profileController from '../controllers/profileController';
import authMiddleware from '../middleware/authMiddleware';

// Criamos uma interface para estender a Request e garantir que 'user' exista
// Reutilizamos a mesma lógica do authMiddleware
interface AuthenticatedRequest extends Request {
  user?: { id: string; [key: string]: any };
}

const router = Router();

// === ROTAS PROTEGIDAS (exigem autenticação) ===

// Rota para obter o perfil do usuário logado
router.get(
  '/me',
  authMiddleware,
  (req: Request, res: Response) => profileController.getCurrentUserProfile(req as AuthenticatedRequest, res)
);

// Rota para atualizar o perfil do usuário logado
router.put(
  '/me',
  authMiddleware,
  (req: Request, res: Response) => profileController.updateCurrentUserProfile(req as AuthenticatedRequest, res)
);

// Rota para deletar o perfil do usuário logado
router.delete(
  '/me',
  authMiddleware,
  (req: Request, res: Response) => profileController.deleteCurrentUserProfile(req as AuthenticatedRequest, res)
);

// Rota para obter o status de completude do perfil
router.get(
  '/me/status', 
  authMiddleware, 
  (req: Request, res: Response) => profileController.getProfileStatus(req as AuthenticatedRequest, res)
);


// === ROTAS PÚBLICAS (não exigem autenticação) ===

// Rota para obter o perfil público de qualquer usuário pelo username
router.get('/:username', profileController.getUserProfileByUsername);

export default router;