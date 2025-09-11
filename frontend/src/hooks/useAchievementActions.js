import { useCallback } from 'react';
import { useAchievements } from '../context/AchievementsContext';

function useAchievementActions() {
    const { refreshAchievements } = useAchievements();

    const triggerAchievementUpdate = useCallback((action, delay = 1500) => {
        // Diferentes delays baseados na ação para garantir que o backend tenha processado
        const actionDelays = {
            'review': 2000,      // Revisão de flashcard
            'create_deck': 1500, // Criação de baralho
            'create_card': 1000, // Criação de flashcard
            'share_deck': 1500,  // Compartilhamento de baralho
            'default': 1500
        };

        const actionDelay = actionDelays[action] || actionDelays.default;
        refreshAchievements(Math.max(delay, actionDelay));
    }, [refreshAchievements]);

    return {
        triggerAchievementUpdate
    };
}

export { useAchievementActions };