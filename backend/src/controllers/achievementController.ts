import { Request, Response } from 'express';
import { logger } from '@/config/logger';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse, AuthUser } from '@/types';
import {
  getUserAchievements,
  getAchievementStats,
  recalculateAllAchievements,
} from '@/services/achievementService';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

/**
 * Get all achievements with user progress
 */
export const getAchievements = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;

  logger.info('Fetching achievements for user', { userId });

  try {
    const achievements = await getUserAchievements(userId);

    const response: ApiResponse = {
      success: true,
      data: achievements,
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error fetching achievements', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch achievements',
    };

    res.status(500).json(response);
  }
});

/**
 * Get achievement statistics for user
 */
export const getAchievementStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;

  logger.info('Fetching achievement stats for user', { userId });

  try {
    const stats = await getAchievementStats(userId);

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error fetching achievement stats', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch achievement statistics',
    };

    res.status(500).json(response);
  }
});

/**
 * Recalculate all achievements for the current user
 */
export const recalculateAchievements = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;

  logger.info('Recalculating achievements for user', { userId });

  try {
    await recalculateAllAchievements(userId);

    const response: ApiResponse = {
      success: true,
      message: 'Achievements recalculated successfully',
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error recalculating achievements', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    const response: ApiResponse = {
      success: false,
      error: 'Failed to recalculate achievements',
    };

    res.status(500).json(response);
  }
});

/**
 * Force recalculate achievements for all users (admin only)
 * This is a maintenance endpoint and should be protected by admin auth
 */
export const forceRecalculate = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user.id;
  const targetUserId = req.body.userId || userId;

  logger.warn('Force recalculation requested', {
    requestedBy: userId,
    targetUser: targetUserId,
  });

  try {
    await recalculateAllAchievements(targetUserId);

    const response: ApiResponse = {
      success: true,
      message: 'Force recalculation completed successfully',
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error in force recalculation', {
      requestedBy: userId,
      targetUser: targetUserId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    const response: ApiResponse = {
      success: false,
      error: 'Failed to force recalculate achievements',
    };

    res.status(500).json(response);
  }
});

export default {
  getAchievements,
  getAchievementStats,
  recalculateAchievements,
  forceRecalculate,
};