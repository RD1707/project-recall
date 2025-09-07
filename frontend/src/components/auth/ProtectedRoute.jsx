import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }
        
        if (currentSession) {
          setSession(currentSession);
          
          // Buscar perfil apenas se temos uma sessão válida
          try {
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('username, full_name')
              .eq('id', currentSession.user.id)
              .single();
            
            if (profileError) {
              console.error('Erro ao buscar perfil:', profileError);
              // Se não encontrar o perfil, consideramos que precisa completar
              setProfile(null);
            } else {
              setProfile(userProfile);
            }
          } catch (profileErr) {
            console.error('Erro na consulta do perfil:', profileErr);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Erro geral na verificação do usuário:', err);
      }
      
      setLoading(false);
    };

    checkUser();
    
    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
      
      setSession(session);
      
      if (!session) {
        setProfile(null);
      } else if (event === 'SIGNED_IN') {
        // Buscar perfil apenas quando há um login
        try {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', session.user.id)
            .single();
          
          setProfile(userProfile);
        } catch (err) {
          console.error('Erro ao buscar perfil após login:', err);
          setProfile(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Carregando sua sessão...
      </div>
    ); 
  }

  // Se não há sessão, redirecionar para login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se há sessão mas não há perfil completo, redirecionar para completar perfil
  if (session && (!profile || !profile.username)) {
    if (location.pathname !== '/complete-profile') {
      return <Navigate to="/complete-profile" replace />;
    }
  }

  // Se há sessão e perfil completo, mas está na página de completar perfil, redirecionar para dashboard
  if (session && profile?.username && location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;