import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Começa como verdadeiro
  const location = useLocation();

  useEffect(() => {
    // onAuthStateChange é a maneira recomendada de lidar com a restauração da sessão.
    // Ele dispara imediatamente com a sessão em cache, se houver.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (session) {
          try {
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('username, full_name')
              .eq('id', session.user.id)
              .single();

            // Se o perfil não for encontrado, o erro 'PGRST116' é esperado, não é um erro real.
            if (profileError && profileError.code !== 'PGRST116') {
               console.error('Erro ao buscar perfil:', profileError);
               setProfile(null);
            } else {
               setProfile(userProfile);
            }
          } catch (profileErr) {
            console.error('Erro na consulta do perfil:', profileErr);
            setProfile(null);
          }
        } else {
            // Garante que o perfil seja limpo se não houver sessão
            setProfile(null);
        }

        // O primeiro evento disparado é 'INITIAL_SESSION',
        // que nos diz que a verificação inicial de autenticação está concluída.
        setLoading(false);
      }
    );

    // Limpa o listener quando o componente é desmontado
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

  // Se não há sessão, redireciona para o login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se há sessão, mas o perfil não está completo, redireciona para a página de completar perfil
  if (session && (!profile || !profile.username)) {
    if (location.pathname !== '/complete-profile') {
      return <Navigate to="/complete-profile" replace />;
    }
  }

  // Se a sessão e o perfil estão completos, mas o usuário está na página de completar perfil, redireciona para o dashboard
  if (session && profile?.username && location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;