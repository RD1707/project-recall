import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAchievements } from '../api/achievements';
import { useAuth } from './AuthContext'; 

const AchievementsContext = createContext(null);

export function useAchievements() {
    const context = useContext(AchievementsContext);
    if (!context) {
        throw new Error('useAchievements deve ser usado dentro de um AchievementsProvider');
    }
    return context;
}

export function AchievementsProvider({ children }) {
    const { isAuthenticated } = useAuth(); 
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(Date.now());

    const loadAchievements = useCallback(async (silent = false) => {

        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        
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
    }, [isAuthenticated]); 

    const refreshAchievements = useCallback((delay = 1000) => {
        setTimeout(() => {
            loadAchievements(true);
        }, delay);
    }, [loadAchievements]);

    useEffect(() => {
        if (isAuthenticated) {
            loadAchievements();
        } else {
            setAchievements([]);
            setLoading(false);
        }
    }, [isAuthenticated, loadAchievements]);

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