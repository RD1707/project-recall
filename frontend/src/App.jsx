import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './api/supabaseClient';
import toast from 'react-hot-toast';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DeckDetail from './pages/DeckDetail';
import StudySession from './pages/StudySession';
import Progress from './pages/Progress';
import Ajuda from './pages/Ajuda';
import CompleteProfile from './pages/CompleteProfile';
import ProtectedRoute from './components/auth/ProtectedRoute'; 
import SharedDeck from './pages/SharedDeck';

const AuthHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.username) {
          toast.success('Login bem-sucedido!');
          navigate('/dashboard');
        } else {
          toast('Quase lá! Complete seu perfil para continuar.');
          navigate('/complete-profile');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null; 
};

function App() {
  return (
    <BrowserRouter>
      <AuthHandler />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ajuda" element={<Ajuda />} />
        <Route path="/shared-deck/:shareableId" element={<SharedDeck />} /> 

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/deck/:deckId" element={<ProtectedRoute><DeckDetail /></ProtectedRoute>} />
        <Route path="/study/:deckId" element={<ProtectedRoute><StudySession /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;