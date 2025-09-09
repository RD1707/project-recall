const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

const updateAchievementProgress = async (userId, metric, value) => {
    if (!userId || !metric) {
        logger.warn('updateAchievementProgress chamado sem userId ou metric.');
        return;
    }

    try {
        const { data: achievements, error: achievementsError } = await supabase
            .from('achievements')
            .select(`
                id,
                goal,
                user_achievements (
                    user_id,
                    progress,
                    unlocked_at
                )
            `)
            .eq('metric', metric)
            .or('user_achievements.unlocked_at.is.null,user_achievements.user_id.is.null');


        if (achievementsError) throw achievementsError;
        if (!achievements || achievements.length === 0) {
            return;
        }

        for (const achievement of achievements) {
            const userAchievement = achievement.user_achievements[0];
            const currentProgress = userAchievement?.progress || 0;

            if (value <= currentProgress) {
                continue;
            }

            const dataToUpsert = {
                user_id: userId,
                achievement_id: achievement.id,
                progress: value,
                updated_at: new Date().toISOString(),
            };

            if (value >= achievement.goal) {
                dataToUpsert.unlocked_at = new Date().toISOString();
                logger.info(`🎉 Conquista desbloqueada! Usuário ${userId}, Conquista ID: ${achievement.id}`);
            }

            const { error: upsertError } = await supabase
                .from('user_achievements')
                .upsert(dataToUpsert, { onConflict: 'user_id, achievement_id' });

            if (upsertError) {
                logger.error(`Erro ao atualizar progresso da conquista ${achievement.id} para o usuário ${userId}:`, upsertError);
            } else {
                 logger.info(`Progresso da conquista ${achievement.id} atualizado para ${value} para o usuário ${userId}.`);
            }
        }

    } catch (error) {
        logger.error(`Erro geral no serviço de conquistas para a métrica ${metric}:`, error);
    }
};

module.exports = {
    updateAchievementProgress,
};