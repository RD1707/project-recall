const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');
const { recalculateAllAchievements, updateAchievementProgress } = require('../services/achievementService');

const getAchievements = async (req, res) => {
    const userId = req.user.id;

    try {
        let { data, error } = await supabase
            .from('achievements')
            .select(`
                id,
                name,
                description,
                icon,
                goal,
                metric,
                user_achievements!left(
                    progress,
                    unlocked_at,
                    user_id
                )
            `);

        if (error) throw error;

        // --- INÍCIO DA LÓGICA DE AUTOCORREÇÃO ---

        // 1. Encontra o progresso atual da conquista de revisões
        const reviewsAchievement = data.find(ach => ach.metric === 'reviews_total');
        const userAchievement = reviewsAchievement?.user_achievements.find(ua => ua.user_id === userId);
        const currentProgress = userAchievement?.progress || 0;

        // 2. Busca o total real de revisões no histórico
        const { count: actualTotalReviews, error: countError } = await supabase
            .from('review_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        if (countError) {
            logger.warn(`[AUTOCORREÇÃO] Não foi possível contar o total de revisões: ${countError.message}`);
        } else if (actualTotalReviews !== null && currentProgress !== actualTotalReviews) {
            // 3. Compara e corrige se estiverem diferentes
            logger.info(`[AUTOCORREÇÃO] Detectada dessincronização na conquista 'reviews_total'. Progresso: ${currentProgress}, Real: ${actualTotalReviews}. Corrigindo...`);
            
            // Chama o serviço para atualizar o valor para o total correto
            await updateAchievementProgress(userId, 'reviews_total', actualTotalReviews);

            // Atualiza os dados locais para enviar a informação correta imediatamente na resposta
            const achievementIndex = data.findIndex(ach => ach.metric === 'reviews_total');
            if (achievementIndex !== -1) {
                const userAchievementIndex = data[achievementIndex].user_achievements.findIndex(ua => ua.user_id === userId);
                if (userAchievementIndex !== -1) {
                    data[achievementIndex].user_achievements[userAchievementIndex].progress = actualTotalReviews;
                } else {
                    // Adiciona o progresso caso não existisse
                     data[achievementIndex].user_achievements.push({
                        user_id: userId,
                        progress: actualTotalReviews,
                        unlocked_at: null
                    });
                }
            }
        }
        // --- FIM DA LÓGICA DE AUTOCORREÇÃO ---

        const formattedData = data.map(ach => {
            const userProgress = ach.user_achievements.find(ua => ua.user_id === userId) 
                || { progress: 0, unlocked_at: null };
            
            return {
                id: ach.id,
                name: ach.name,
                description: ach.description,
                icon: ach.icon,
                goal: ach.goal,
                progress: userProgress.progress,
                unlocked_at: userProgress.unlocked_at,
                display_progress: Math.min(userProgress.progress, ach.goal)
            };
        });

        res.status(200).json(formattedData);

    } catch (error) {
        logger.error(`Erro ao buscar conquistas para o usuário ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar as conquistas.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const recalculateAchievements = async (req, res) => {
    const userId = req.user.id;

    try {
        await recalculateAllAchievements(userId);
        res.status(200).json({ message: 'Conquistas recalculadas com sucesso!' });
    } catch (error) {
        logger.error(`Erro ao recalcular conquistas para o usuário ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao recalcular as conquistas.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const forceRecalculate = async (req, res) => {
    const userId = req.user.id;
    
    try {
        logger.info(`[ACHIEVEMENTS] FORÇA RECÁLCULO para usuário: ${userId}`);
        await recalculateAllAchievements(userId);
        
        res.status(200).json({ 
            message: 'Conquistas recalculadas com sucesso!',
            userId: userId
        });
    } catch (error) {
        logger.error(`Erro ao forçar recálculo das conquistas para usuário ${userId}:`, error);
        res.status(500).json({ 
            message: 'Erro ao recalcular conquistas.', 
            code: 'RECALCULATION_ERROR' 
        });
    }
};

module.exports = {
    getAchievements,
    recalculateAchievements,
    forceRecalculate,
};