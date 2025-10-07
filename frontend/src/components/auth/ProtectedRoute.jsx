import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // Hook para detectar mudanças de rota

  useEffect(() => {
    // Esta função será executada toda vez que a URL mudar
    const checkUserSessionAndProfile = async () => {
      setLoading(true); // Inicia o carregamento a cada nova página

      // 1. Pega a sessão atual. É rápido, pois lê do localStorage.
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession) {
        // 2. Se a sessão existe, busca o perfil do usuário.
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', currentSession.user.id)
          .single();
        setProfile(userProfile);
      }
      
      // 3. Termina o carregamento.
      setLoading(false);
    };

    checkUserSessionAndProfile();

  }, [location]); // A MÁGICA ESTÁ AQUI: o array de dependências agora observa a 'location'.

  if (loading) {
    return <LoadingSpinner message="Verificando sua autenticação..." />;
  }

  // A lógica de redirecionamento permanece a mesma
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