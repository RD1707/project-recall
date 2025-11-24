const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');
const { recalculateAllAchievements } = require('../services/achievementService');

const fetchAndFormatAchievements = async (userId) => {
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

    return data.map(ach => {
        const userAchievements = Array.isArray(ach.user_achievements) ? ach.user_achievements : [];
        const userProgress = userAchievements.find(ua => ua.user_id === userId) 
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
};

const getAchievements = async (req, res) => {
    const userId = req.user.id;
    try {
        const formattedData = await fetchAndFormatAchievements(userId);
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
        const formattedData = await fetchAndFormatAchievements(userId);
        res.status(200).json(formattedData);
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
        const formattedData = await fetchAndFormatAchievements(userId);
        res.status(200).json(formattedData);
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