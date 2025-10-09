const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const updateAchievementProgress = async (userId, metric, value) => {
    if (!userId || !metric) {
        logger.warn('updateAchievementProgress chamado sem userId ou metric.');
        return;
    }

    logger.info(`[ACHIEVEMENTS] Iniciando update - userId: ${userId}, metric: ${metric}, value:`, value);

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
            
            if (userAchievement?.unlocked_at) {
                logger.info(`[ACHIEVEMENTS] Pulando conquista ${achievement.id} (já desbloqueada)`);
                continue;
            }

            let newProgress;
            const isIncremental = typeof value === 'object' && value.increment;

            if (isIncremental) {
                newProgress = currentProgress + value.increment;
                logger.info(`[ACHIEVEMENTS] Atualização incremental para ${achievement.id}. Progresso: ${currentProgress} -> ${newProgress}`);
            } else {
                newProgress = value;
                if (newProgress < currentProgress) {
                    logger.info(`[ACHIEVEMENTS] Pulando conquista ${achievement.id} (novo valor é menor que o progresso atual)`);
                    continue;
                }
                logger.info(`[ACHIEVEMENTS] Atualização absoluta para ${achievement.id}. Progresso: ${currentProgress} -> ${newProgress}`);
            }

            const dataToUpsert = {
                user_id: userId,
                achievement_id: achievement.id,
                progress: newProgress,
                updated_at: new Date().toISOString(),
            };

            if (newProgress >= achievement.goal) {
                dataToUpsert.unlocked_at = new Date().toISOString();
                logger.info(` Conquista desbloqueada! Usuário ${userId}, Conquista ID: ${achievement.id}`);
            }

            logger.info(`[ACHIEVEMENTS] Tentando upsert para achievement ${achievement.id}:`, dataToUpsert);

            const { data: upsertResult, error: upsertError } = await supabase
                .from('user_achievements')
                .upsert(dataToUpsert, { onConflict: 'user_id, achievement_id' })
                .select();

            if (upsertError) {
                logger.error(`[ACHIEVEMENTS]  Erro ao atualizar progresso da conquista ${achievement.id} para o usuário ${userId}:`, upsertError);
            } else {
                logger.info(`[ACHIEVEMENTS]  Progresso da conquista ${achievement.id} atualizado para ${newProgress} para o usuário ${userId}.`);
                logger.info(`[ACHIEVEMENTS]  Dados salvos no banco:`, upsertResult);
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
            .select('current_streak')
            .eq('id', userId)
            .single();
            
        if (profile) {
            await updateAchievementProgress(userId, 'streak_days', profile.current_streak);
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
            if (totalDecks >= 1) {
                logger.info(`[ACHIEVEMENTS] Atualizando decks_created para 1`);
                await updateAchievementProgress(userId, 'decks_created', 1);
            }
            logger.info(`[ACHIEVEMENTS] Atualizando decks_created_total para ${totalDecks}`);
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