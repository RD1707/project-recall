import { supabase } from '@/config/supabaseClient';
import { logger, performanceLogger } from '@/config/logger';
import { Achievement, UserAchievement, User } from '@/types';
import { ValidationError } from '@/middleware/errorHandler';

// Types for achievement metrics
type AchievementMetric =
  | 'reviews_total'
  | 'streak_days'
  | 'cards_mastered'
  | 'decks_created'
  | 'decks_created_total'
  | 'study_sessions'
  | 'perfect_streaks'
  | 'community_shares';

interface AchievementWithProgress {
  id: number;
  goal: number;
  user_achievements: {
    user_id: string;
    progress: number;
    unlocked_at: string | null;
  }[];
}

interface AchievementUpdateResult {
  achievement_id: number;
  old_progress: number;
  new_progress: number;
  unlocked: boolean;
}

/**
 * Updates achievement progress for a specific user and metric
 */
export const updateAchievementProgress = async (
  userId: string,
  metric: AchievementMetric,
  value: number
): Promise<AchievementUpdateResult[]> => {
  // Input validation
  if (!userId || typeof userId !== 'string') {
    logger.warn('updateAchievementProgress called without valid userId');
    return [];
  }

  if (!metric || typeof metric !== 'string') {
    logger.warn('updateAchievementProgress called without valid metric');
    return [];
  }

  if (typeof value !== 'number' || value < 0) {
    throw new ValidationError('Achievement value must be a non-negative number');
  }

  const timer = performanceLogger.startTimer('achievement-progress-update');

  logger.info('Starting achievement progress update', {
    userId,
    metric,
    value,
  });

  try {
    // Fetch achievements for the specific metric
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select(`
        id,
        goal,
        user_achievements!left (
          user_id,
          progress,
          unlocked_at
        )
      `)
      .eq('metric', metric) as {
        data: AchievementWithProgress[] | null;
        error: any;
      };

    if (achievementsError) {
      logger.error('Error fetching achievements for metric', {
        metric,
        error: achievementsError.message,
        details: achievementsError.details,
      });
      throw new Error(`Database error: ${achievementsError.message}`);
    }

    if (!achievements || achievements.length === 0) {
      logger.warn('No achievements found for metric', { metric });
      return [];
    }

    logger.info(`Found ${achievements.length} achievements for metric ${metric}`);

    const results: AchievementUpdateResult[] = [];

    // Process each achievement
    for (const achievement of achievements) {
      const userAchievement = achievement.user_achievements.find(
        ua => ua.user_id === userId
      );
      const currentProgress = userAchievement?.progress || 0;

      // Skip if already unlocked
      if (userAchievement?.unlocked_at) {
        logger.debug('Skipping unlocked achievement', {
          achievementId: achievement.id,
          userId,
          unlockedAt: userAchievement.unlocked_at,
        });
        continue;
      }

      // Skip if progress hasn't improved (except for initialization)
      if (value < currentProgress) {
        logger.debug('Skipping achievement with lower progress', {
          achievementId: achievement.id,
          currentProgress,
          newValue: value,
        });
        continue;
      }

      // Allow updates even for same value to ensure initialization
      const shouldUpdate = value > currentProgress ||
                          (value === currentProgress && currentProgress === 0);

      if (!shouldUpdate) {
        continue;
      }

      // Determine if achievement should be unlocked
      const shouldUnlock = value >= achievement.goal;
      const unlocked_at = shouldUnlock ? new Date().toISOString() : null;

      logger.info('Updating achievement progress', {
        achievementId: achievement.id,
        userId,
        oldProgress: currentProgress,
        newProgress: value,
        goal: achievement.goal,
        willUnlock: shouldUnlock,
      });

      // Upsert user achievement progress
      const { error: upsertError } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: userId,
          achievement_id: achievement.id,
          progress: value,
          unlocked_at,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,achievement_id',
        });

      if (upsertError) {
        logger.error('Error upserting user achievement', {
          achievementId: achievement.id,
          userId,
          error: upsertError.message,
        });
        throw new Error(`Failed to update achievement: ${upsertError.message}`);
      }

      results.push({
        achievement_id: achievement.id,
        old_progress: currentProgress,
        new_progress: value,
        unlocked: shouldUnlock,
      });

      // Log achievement unlock
      if (shouldUnlock && !userAchievement?.unlocked_at) {
        logger.info('🎉 Achievement unlocked!', {
          achievementId: achievement.id,
          userId,
          metric,
          progress: value,
          goal: achievement.goal,
        });
      }
    }

    timer.end({
      userId,
      metric,
      achievementsProcessed: achievements.length,
      achievementsUpdated: results.length,
      achievementsUnlocked: results.filter(r => r.unlocked).length,
    });

    return results;

  } catch (error) {
    timer.end({
      userId,
      metric,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    logger.error('Error updating achievement progress', {
      userId,
      metric,
      value,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
};

/**
 * Recalculates all achievements for a specific user
 */
export const recalculateAllAchievements = async (userId: string): Promise<void> => {
  if (!userId || typeof userId !== 'string') {
    throw new ValidationError('Valid user ID is required');
  }

  const timer = performanceLogger.startTimer('achievement-recalculation');

  logger.info('Starting achievement recalculation', { userId });

  try {
    // Total reviews count
    logger.debug('Calculating total reviews', { userId });
    const { count: totalReviews, error: reviewsError } = await supabase
      .from('review_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (reviewsError) {
      logger.error('Error counting reviews', {
        userId,
        error: reviewsError.message,
      });
    } else if (totalReviews !== null) {
      await updateAchievementProgress(userId, 'reviews_total', totalReviews);
    }

    // Current study streak
    logger.debug('Fetching user profile for streak', { userId });
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_streak')
      .eq('id', userId)
      .single();

    if (profileError) {
      logger.error('Error fetching user profile', {
        userId,
        error: profileError.message,
      });
    } else if (profile) {
      await updateAchievementProgress(userId, 'streak_days', profile.current_streak);
    }

    // Cards mastered (cards with interval > 21 days)
    logger.debug('Calculating mastered cards', { userId });
    const { count: masteredCards, error: masteredError } = await supabase
      .from('flashcards')
      .select('id, decks!inner(user_id)', { count: 'exact', head: true })
      .eq('decks.user_id', userId)
      .gt('interval', 21);

    if (masteredError) {
      logger.error('Error counting mastered cards', {
        userId,
        error: masteredError.message,
      });
    } else if (masteredCards !== null) {
      await updateAchievementProgress(userId, 'cards_mastered', masteredCards);
    }

    // Decks created
    logger.debug('Calculating created decks', { userId });
    const { count: totalDecks, error: decksCountError } = await supabase
      .from('decks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (decksCountError) {
      logger.error('Error counting decks', {
        userId,
        error: decksCountError.message,
      });
    } else if (totalDecks !== null) {
      // Update both binary (created at least 1) and total count
      if (totalDecks >= 1) {
        await updateAchievementProgress(userId, 'decks_created', 1);
      }
      await updateAchievementProgress(userId, 'decks_created_total', totalDecks);
    }

    timer.end({
      userId,
      success: true,
    });

    logger.info('Successfully recalculated all achievements', { userId });

  } catch (error) {
    timer.end({
      userId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    logger.error('Error recalculating achievements', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
};

/**
 * Gets all achievements with progress for a specific user
 */
export const getUserAchievements = async (userId: string): Promise<(Achievement & {
  progress: number;
  unlocked_at: string | null;
  completion_percentage: number;
})[]> => {
  if (!userId || typeof userId !== 'string') {
    throw new ValidationError('Valid user ID is required');
  }

  const timer = performanceLogger.startTimer('get-user-achievements');

  try {
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select(`
        id,
        name,
        description,
        icon,
        goal,
        metric,
        created_at,
        user_achievements!left (
          progress,
          unlocked_at,
          user_id
        )
      `)
      .order('id');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const formattedAchievements = achievements.map(achievement => {
      const userProgress = achievement.user_achievements.find(
        (ua: any) => ua.user_id === userId
      );

      const progress = userProgress?.progress || 0;
      const unlocked_at = userProgress?.unlocked_at || null;
      const completion_percentage = Math.min((progress / achievement.goal) * 100, 100);

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        goal: achievement.goal,
        metric: achievement.metric,
        created_at: achievement.created_at,
        progress,
        unlocked_at,
        completion_percentage: Math.round(completion_percentage),
      };
    });

    timer.end({
      userId,
      achievementsCount: formattedAchievements.length,
      unlockedCount: formattedAchievements.filter(a => a.unlocked_at).length,
    });

    return formattedAchievements;

  } catch (error) {
    timer.end({
      userId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
};

/**
 * Gets achievement statistics for a user
 */
export const getAchievementStats = async (userId: string): Promise<{
  total_achievements: number;
  unlocked_achievements: number;
  completion_percentage: number;
  recent_unlocks: Array<{
    achievement_id: number;
    name: string;
    unlocked_at: string;
  }>;
}> => {
  if (!userId || typeof userId !== 'string') {
    throw new ValidationError('Valid user ID is required');
  }

  try {
    const achievements = await getUserAchievements(userId);

    const total_achievements = achievements.length;
    const unlocked_achievements = achievements.filter(a => a.unlocked_at).length;
    const completion_percentage = total_achievements > 0
      ? Math.round((unlocked_achievements / total_achievements) * 100)
      : 0;

    // Get recent unlocks (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recent_unlocks = achievements
      .filter(a => a.unlocked_at && new Date(a.unlocked_at) > thirtyDaysAgo)
      .sort((a, b) => new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime())
      .slice(0, 5)
      .map(a => ({
        achievement_id: a.id,
        name: a.name,
        unlocked_at: a.unlocked_at!,
      }));

    return {
      total_achievements,
      unlocked_achievements,
      completion_percentage,
      recent_unlocks,
    };

  } catch (error) {
    logger.error('Error getting achievement stats', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
};

export default {
  updateAchievementProgress,
  recalculateAllAchievements,
  getUserAchievements,
  getAchievementStats,
};