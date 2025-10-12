import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAchievements, recalculateAchievements } from '../api/achievements';
import { supabase } from '../api/supabaseClient';

const AchievementsContext = createContext();

function useAchievements() {
    const context = useContext(AchievementsContext);
    if (!context) {
        throw new Error('useAchievements must be used within an AchievementsProvider');
    }
    return context;
}

function AchievementsProvider({ children }) {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsUserAuthenticated(!!session);
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsUserAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadAchievements = useCallback(async (silent = false) => {
        if (!isUserAuthenticated) {
            setLoading(false);
            return;
        }
        
        if (!silent) setLoading(true);
        
        try {
            // SOLUÇÃO FINAL: Faz uma única chamada que recalcula e já retorna os dados frescos.
            const data = await recalculateAchievements();
            setAchievements(data || []);
            setLastRefresh(Date.now());
        } catch (error) {
            console.error("Falha ao carregar/sincronizar conquistas", error);
            setAchievements([]);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [isUserAuthenticated]);

    const refreshAchievements = useCallback((delay = 1000) => {
        setTimeout(() => {
            loadAchievements(true);
        }, delay);
    }, [loadAchievements]);

    useEffect(() => {
        if (isUserAuthenticated) {
            loadAchievements();
        } else {
            setAchievements([]);
            setLoading(false);
        }
    }, [isUserAuthenticated, loadAchievements]);


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

export { useAchievements, AchievementsProvider };