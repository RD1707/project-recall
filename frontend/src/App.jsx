import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
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
import Community from './pages/Community'; // NOVA IMPORTAÇÃO

import ProtectedRoute from './components/auth/ProtectedRoute';
import CookieBanner from './components/common/CookieBanner';
import { SocketProvider } from './context/SocketContext';
import { AchievementsProvider } from './context/AchievementsContext';
import PublicProfile from './pages/PublicProfile';


function App() {
  return (
    <SocketProvider>
      <AchievementsProvider>
      <BrowserRouter>
        <CookieBanner />

        <Routes>
          <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ajuda" element={<Ajuda />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/shared-deck/:shareableId" element={<SharedDeck />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/deck/:deckId" element={<ProtectedRoute><DeckDetail /></ProtectedRoute>} />
          <Route path="/study/:deckId" element={<ProtectedRoute><StudySession /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
          <Route path="/quiz/:roomId" element={<ProtectedRoute><QuizLobby /></ProtectedRoute>} />
          <Route path="/quiz/game/:roomId" element={<ProtectedRoute><QuizGame /></ProtectedRoute>} /> 
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
          <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      </AchievementsProvider>
    </SocketProvider>
  );
}

export default App;