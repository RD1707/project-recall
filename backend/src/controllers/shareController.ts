import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse, AuthUser } from '@/types';
import { logger } from '@/config/logger';

interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

export const getSharedDecks = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  logger.info('Share endpoint called', { userId: req.user.id });

  const response: ApiResponse = {
    success: true,
    message: 'Share controller - TODO: Implement',
  };

  res.status(200).json(response);
});

export default {
  getSharedDecks,
};