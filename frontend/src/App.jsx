import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Landing from './src/pages/Landing';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Ajuda from './src/pages/Ajuda';
import Sobre from './src/pages/Sobre';
import Contato from './src/pages/Contato';
import ApiDocs from './src/pages/ApiDocs';
import Privacidade from './src/pages/Privacidade';
import Termos from './src/pages/Termos';
import SharedDeck from './src/pages/SharedDeck';

import Dashboard from './src/pages/Dashboard';
import DeckDetail from './src/pages/DeckDetail';
import StudySession from './src/pages/StudySession';
import Progress from './src/pages/Progress';
import CompleteProfile from './src/pages/CompleteProfile';

import ProtectedRoute from './src/components/auth/ProtectedRoute'; 
import CookieBanner from './src/components/common/CookieBanner';

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

