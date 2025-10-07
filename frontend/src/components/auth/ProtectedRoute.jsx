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
    // Esta é a maneira robusta de verificar a autenticação.
    // O onAuthStateChange lida com o carregamento inicial, login e logout.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session) {
        // Se há uma sessão, buscamos o perfil.
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile);
      } else {
        // Se não há sessão, não há perfil.
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // O array vazio [] garante que isso só rode uma vez.

  if (loading) {
    return <LoadingSpinner message="A carregar a sua sessão..." />;
  }

  if (!session) {
    // Se não há sessão, redireciona para o login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if ((!profile || !profile.username) && location.pathname !== '/complete-profile') {
    // Se a sessão existe mas o perfil está incompleto, redireciona para completar o perfil.
    return <Navigate to="/complete-profile" replace />;
  }

  if (profile?.username && location.pathname === '/complete-profile') {
    // Se o perfil já está completo, não deixa o usuário acessar a página /complete-profile.
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;