import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import { fetchProfile } from '../api/profile';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUserData = useCallback(async (currentSession) => {
        if (currentSession?.user) {
            try {
                const profileData = await fetchProfile();
                setProfile(profileData);
            } catch (error) {
                console.error("Falha ao carregar perfil do usuário:", error);
                setProfile(null);
            }
        } else {
            setProfile(null);
        }
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true);
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                setSession(currentSession);
                await loadUserData(currentSession);
            } catch (error) {
                console.error("Erro ao inicializar autenticação:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            setLoading(true);
            setSession(newSession);
            await loadUserData(newSession);
            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [loadUserData]);

    const value = {
        session,
        profile,
        isAuthenticated: !!session?.user,
        loading,
        updateProfile: (updatedData) => {
            setProfile(prev => ({ ...prev, ...updatedData }));
        }
    };

    if (loading) {
        return <LoadingSpinner message="Verificando sessão..." />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};