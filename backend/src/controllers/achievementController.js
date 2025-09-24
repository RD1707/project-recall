const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');
const { recalculateAllAchievements } = require('../services/achievementService');

const getAchievements = async (req, res) => {
    const userId = req.user.id;

    try {
        const { data, error } = await supabase
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