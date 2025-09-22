import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse, AuthUser } from '@/types';
import { logger } from '@/config/logger';

interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

export const getCommunityDecks = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  logger.info('Community endpoint called', { userId: req.user.id });

  const response: ApiResponse = {
    success: true,
    message: 'Community controller - TODO: Implement',
  };

  res.status(200).json(response);
});

export default {
  getCommunityDecks,
};