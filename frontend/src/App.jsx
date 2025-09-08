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

import ProtectedRoute from './components/auth/ProtectedRoute';
import CookieBanner from './components/common/CookieBanner';

function App() {
  return (
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
        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;