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
      setLoading(true);

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name')
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
  }, []); // Removida dependência [location] para evitar loop infinito

  if (loading) {
    return <LoadingSpinner message="Carregando sua sessão..." />;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if ((!profile || !profile.username) && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  if (profile?.username && location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;