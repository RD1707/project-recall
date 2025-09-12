import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner'; 

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      if (loading === false) setLoading(true);

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name, has_completed_onboarding')
          .eq('id', currentSession.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Erro ao buscar perfil:', profileError);
        } else {
          setProfile(userProfile);
        }
      }
      
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location]);

  if (loading) {
    return <LoadingSpinner message="Carregando sua sessão..." />;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirecionar para complete-profile apenas se:
  // 1. Não existe perfil OU
  // 2. Existe perfil mas não tem username (usuário do Google) OU  
  // 3. Existe perfil mas has_completed_onboarding é false
  const needsProfileCompletion = !profile || 
    !profile.username || 
    !profile.has_completed_onboarding;

  if (needsProfileCompletion && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  if (profile?.username && profile?.has_completed_onboarding && location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;