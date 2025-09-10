const supabase = require('../config/supabaseClient');
const logger = require('../config/logger');

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
                    unlocked_at
                )
            `)
            .eq('user_achievements.user_id', userId);

        if (error) throw error;

        const formattedData = data.map(ach => {
            const userProgress = ach.user_achievements[0] || { progress: 0, unlocked_at: null };
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

module.exports = {
    getAchievements,
};