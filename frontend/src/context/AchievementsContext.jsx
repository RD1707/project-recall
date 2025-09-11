import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAchievements } from '../api/achievements';

const AchievementsContext = createContext();

// Separar o hook personalizado em uma função nomeada
function useAchievements() {
    const context = useContext(AchievementsContext);
    if (!context) {
        throw new Error('useAchievements must be used within an AchievementsProvider');
    }
    return context;
}

// Separar o provider em uma função nomeada
function AchievementsProvider({ children }) {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(Date.now());

    const loadAchievements = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        
        try {
            const data = await fetchAchievements();
            setAchievements(data || []);
            setLastRefresh(Date.now());
        } catch (error) {
            console.error("Falha ao carregar conquistas", error);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    // Função para atualizar conquistas após ações do usuário
    const refreshAchievements = useCallback((delay = 1000) => {
        setTimeout(() => {
            loadAchievements(true); // Silent refresh
        }, delay);
    }, [loadAchievements]);

    // Carregamento inicial
    useEffect(() => {
        loadAchievements();
    }, [loadAchievements]);

    // Refresh automático DESABILITADO para debug
    useEffect(() => {
        // Comentado temporariamente para reduzir logs
        // let interval;
        
        // const handleVisibilityChange = () => {
        //     if (!document.hidden) {
        //         // Página ficou visível, refresh as conquistas
        //         loadAchievements(true);
        //     }
        // };

        // // Refresh periódico apenas se a página estiver visível
        // const startInterval = () => {
        //     interval = setInterval(() => {
        //         if (!document.hidden) {
        //             loadAchievements(true);
        //         }
        //     }, 30000); // 30 segundos
        // };

        // startInterval();
        // document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            // if (interval) clearInterval(interval);
            // document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [loadAchievements]);

    const value = {
        achievements,
        loading,
        lastRefresh,
        refreshAchievements,
        loadAchievements
    };

    return (
        <AchievementsContext.Provider value={value}>
            {children}
        </AchievementsContext.Provider>
    );
}

// Exportações nomeadas no final do arquivo para melhor compatibilidade com Fast Refresh
export { useAchievements, AchievementsProvider };