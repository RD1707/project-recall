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
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        setSession(currentSession);
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', currentSession.user.id)
          .single();
        
        setProfile(userProfile);
      }
      setLoading(false);
    };

    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (!session) {
            setProfile(null);
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };

  }, []);

  if (loading) {
    return <div>Carregando sua sessão...</div>; 
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (session && (!profile || !profile.username)) {
    if (location.pathname !== '/complete-profile') {
      return <Navigate to="/complete-profile" replace />;
    }
  }

  if (session && profile?.username && location.pathname === '/complete-profile') {
      return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;