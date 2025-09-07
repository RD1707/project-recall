import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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

function App() {
  return (
    <BrowserRouter>
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