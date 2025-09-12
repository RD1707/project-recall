import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const mountedRef = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (!mountedRef.current) return;
        
        if (!loading) setLoading(true);
        setError(null);

        // Timeout para evitar loading infinito
        timeoutRef.current = setTimeout(() => {
          if (mountedRef.current && loading) {
            setError('Tempo limite esgotado ao verificar autenticação');
            setLoading(false);
          }
        }, 10000);

        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          if (mountedRef.current) {
            setError('Erro ao verificar autenticação');
            setSession(null);
            setLoading(false);
          }
          return;
        }

        if (!mountedRef.current) return;
        setSession(currentSession);

        if (currentSession?.user?.id) {
          try {
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('username, full_name, avatar_url, created_at')
              .eq('id', currentSession.user.id)
              .single();

            if (!mountedRef.current) return;

            if (profileError) {
              if (profileError.code === 'PGRST116') {
                // Perfil não existe ainda, isso é normal para novos usuários
                setProfile(null);
              } else {
                console.error('Erro ao buscar perfil:', profileError);
                // Não bloquear o acesso, apenas logar o erro
                setProfile(null);
              }
            } else {
              setProfile(userProfile);
            }
          } catch (profileFetchError) {
            console.error('Erro inesperado ao buscar perfil:', profileFetchError);
            // Continuar sem o perfil em caso de erro
            setProfile(null);
          }
        }
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        if (mountedRef.current) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        if (mountedRef.current) {
          setError('Erro inesperado na autenticação');
          setLoading(false);
        }
      }
    };

    checkUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mountedRef.current) return;
      
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT' || !newSession) {
        setSession(null);
        setProfile(null);
        setError(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        // Recarregar perfil quando necessário
        if (newSession?.user?.id) {
          try {
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('username, full_name, avatar_url, created_at')
              .eq('id', newSession.user.id)
              .single();

            if (mountedRef.current) {
              if (!profileError) {
                setProfile(userProfile);
              }
            }
          } catch (error) {
            console.error('Erro ao recarregar perfil:', error);
          }
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname]); // Apenas pathname para evitar re-renders desnecessários

  // Estados de loading e erro
  if (loading) {
    return <LoadingSpinner message="Verificando autenticação..." />;
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2>Erro de Autenticação</h2>
        <p>{error}</p>
        <div style={{ marginTop: '1rem' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '0.75rem 1.5rem', 
              marginRight: '0.5rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Tentar Novamente
          </button>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{ 
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: '#4f46e5',
              border: '1px solid #4f46e5',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Verificar se há sessão válida
  if (!session || !session.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar se o token não expirou
  if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
    toast.error('Sua sessão expirou. Faça login novamente.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Lógica de redirecionamento para perfil
  const needsProfileCompletion = (!profile || !profile.username) && location.pathname !== '/complete-profile';
  const hasProfileButOnCompleteProfilePage = profile?.username && location.pathname === '/complete-profile';

  if (needsProfileCompletion) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (hasProfileButOnCompleteProfilePage) {
    return <Navigate to="/dashboard" replace />;
  }

  // Tudo OK, renderizar o componente filho
  return children;
}

export default ProtectedRoute;