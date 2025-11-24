const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const updateAchievementProgress = async (userId, metric, value) => {
    if (!userId || !metric) {
        logger.warn('updateAchievementProgress chamado sem userId ou metric.');
        return;
    }

    logger.info(`[ACHIEVEMENTS] Iniciando updateAchievementProgress - userId: ${userId}, metric: ${metric}, value: ${value}`);

    const stoppableMetrics = ['cards_mastered'];

    try {
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
            .eq('metric', metric);


        if (achievementsError) {
            logger.error(`[ACHIEVEMENTS] Erro ao buscar achievements para metric ${metric}:`, achievementsError);
            throw achievementsError;
        }
        if (!achievements || achievements.length === 0) {
            logger.warn(`[ACHIEVEMENTS] Nenhuma conquista encontrada para a métrica: ${metric}`);
            return;
        }

        logger.info(`[ACHIEVEMENTS] Encontradas ${achievements.length} conquistas para a métrica ${metric}`);

        for (const achievement of achievements) {
            const userAchievement = achievement.user_achievements.find(ua => ua.user_id === userId);
            const currentProgress = userAchievement?.progress || 0;
            const canDecrease = stoppableMetrics.includes(metric);

            if (!canDecrease && (userAchievement?.unlocked_at || value < currentProgress)) {
                logger.info(`[ACHIEVEMENTS] Pulando achievement ${achievement.id} - progresso não pode diminuir ou já desbloqueado.`);
                continue;
            }

            logger.info(`[ACHIEVEMENTS] Processando achievement ${achievement.id}, progresso: ${currentProgress} -> ${value}`);

            const dataToUpsert = {
                user_id: userId,
                achievement_id: achievement.id,
                progress: value,
                updated_at: new Date().toISOString(),
            };

            if (value >= achievement.goal) {
                if (!userAchievement?.unlocked_at) {
                    dataToUpsert.unlocked_at = new Date().toISOString();
                    logger.info(` Conquista desbloqueada! Usuário ${userId}, Conquista ID: ${achievement.id}`);
                }
            } else {
                if (userAchievement?.unlocked_at) { 
                    dataToUpsert.unlocked_at = null;
                    logger.info(` Conquista revogada! Usuário ${userId}, Conquista ID: ${achievement.id}`);
                }
            }

            const { data: upsertResult, error: upsertError } = await supabase
                .from('user_achievements')
                .upsert(dataToUpsert, { onConflict: 'user_id, achievement_id' })
                .select();

            if (upsertError) {
                logger.error(`[ACHIEVEMENTS] Erro ao atualizar progresso da conquista ${achievement.id} para o usuário ${userId}:`, upsertError);
            } else {
                logger.info(`[ACHIEVEMENTS] Progresso da conquista ${achievement.id} atualizado para ${value} para o usuário ${userId}.`);
            }
        }

    } catch (error) {
        logger.error(`Erro geral no serviço de conquistas para a métrica ${metric}:`, error);
    }
};

const recalculateAllAchievements = async (userId) => {
    if (!userId) {
        logger.warn('recalculateAllAchievements chamado sem userId.');
        return;
    }

    try {
        const { count: totalReviews } = await supabase
            .from('review_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        if (totalReviews !== null) {
            await updateAchievementProgress(userId, 'reviews_total', totalReviews);
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('max_streak')
            .eq('id', userId)
            .single();
            
        if (profile) {
            await updateAchievementProgress(userId, 'streak_days', profile.max_streak);
        }

        const { count: masteredCards } = await supabase
            .from('flashcards')
            .select('id, decks!inner(user_id)', { count: 'exact', head: true })
            .eq('decks.user_id', userId)
            .gt('interval', 21);
            
        if (masteredCards !== null) {
            await updateAchievementProgress(userId, 'cards_mastered', masteredCards);
        }

        logger.info(`[ACHIEVEMENTS] Contando decks para usuário ${userId}`);
        const { count: totalDecks, error: decksCountError } = await supabase
            .from('decks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
            
        if (decksCountError) {
            logger.error(`[ACHIEVEMENTS] Erro ao contar decks:`, decksCountError);
        } else {
            logger.info(`[ACHIEVEMENTS] Total de decks encontrados: ${totalDecks} para o usuário ${userId}`);
        }
            
        if (totalDecks !== null) {
            await updateAchievementProgress(userId, 'decks_created', totalDecks);
            await updateAchievementProgress(userId, 'decks_created_total', totalDecks);
        }

        logger.info(`Recalculadas todas as conquistas para o usuário ${userId}`);
    } catch (error) {
        logger.error(`Erro ao recalcular conquistas para o usuário ${userId}:`, error);
    }
};

module.exports = {
    updateAchievementProgress,
    recalculateAllAchievements,
};