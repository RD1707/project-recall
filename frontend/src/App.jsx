import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importações dos componentes e páginas
import PublicProfile from './pages/PublicProfile';
import { SocketProvider } from './context/SocketContext';
import { AchievementsProvider } from './context/AchievementsContext';
import { SinapseProvider } from './context/SinapseContext';
import CookieBanner from './components/common/CookieBanner';
import Sinapse from './pages/Sinapse';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import EmailConfirmation from './pages/EmailConfirmation';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Ajuda from './pages/Ajuda';
import Sobre from './pages/Sobre';
import Contato from './pages/Contato';
import ApiDocs from './pages/ApiDocs';
import Privacidade from './pages/Privacidade';
import Termos from './pages/Termos';
import SharedDeck from './pages/SharedDeck';
import Dashboard from './pages/Dashboard';
import DeckDetail from './pages/DeckDetail';
import StudySession from './pages/StudySession';
import Progress from './pages/Progress';
import CompleteProfile from './pages/CompleteProfile';
import Ranking from './pages/Ranking';
import QuizLobby from './pages/QuizLobby';
import QuizGame from './pages/QuizGame';
import Community from './pages/Community';
import CommunityDeckView from './pages/CommunityDeckView';
import Profile from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  // Lógica de tema inteligente: detecta preferência do navegador na primeira visita
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      document.body.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      document.body.setAttribute('data-theme', defaultTheme);
    }
  }, []);

  return (
    <SocketProvider>
      <AchievementsProvider>
        <SinapseProvider>
          <BrowserRouter>
            <CookieBanner />

            <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route path="/email-verification/confirm" element={<EmailConfirmation />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/ajuda" element={<Ajuda />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/shared-deck/:shareableId" element={<SharedDeck />} />

            {/* Rotas Protegidas */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/sinapse" element={<ProtectedRoute><Sinapse /></ProtectedRoute>} />
            <Route path="/deck/:deckId" element={<ProtectedRoute><DeckDetail /></ProtectedRoute>} />
            <Route path="/study/:deckId" element={<ProtectedRoute><StudySession /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
            <Route path="/quiz/:roomId" element={<ProtectedRoute><QuizLobby /></ProtectedRoute>} />
            <Route path="/quiz/game/:roomId" element={<ProtectedRoute><QuizGame /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/community/deck/:deckId" element={<ProtectedRoute><CommunityDeckView /></ProtectedRoute>} />
            <Route path="/my-profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:username" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
            <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
          </Routes>
          </BrowserRouter>
        </SinapseProvider>
      </AchievementsProvider>
    </SocketProvider>
  );
}

export default App;