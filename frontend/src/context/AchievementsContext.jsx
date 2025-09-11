import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAchievements } from '../api/achievements';
import { supabase } from '../api/supabaseClient'; // Importamos o supabase

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
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false); // Novo estado

    // Verifica o status da autenticação
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
        // Só executa se o utilizador estiver autenticado
        if (!isUserAuthenticated) {
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
    }, [isUserAuthenticated]); // Adicionamos a dependência

    const refreshAchievements = useCallback((delay = 1000) => {
        setTimeout(() => {
            loadAchievements(true);
        }, delay);
    }, [loadAchievements]);

    // Carregamento inicial só acontece se o status de autenticação mudar para true
    useEffect(() => {
        if (isUserAuthenticated) {
            loadAchievements();
        } else {
            // Limpa os dados se o utilizador fizer logout
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