import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DeckDetail from './pages/DeckDetail';
import StudySession from './pages/StudySession'; // 1. Importar a nova página

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deck/:deckId" element={<DeckDetail />} />
        <Route path="/study/:deckId" element={<StudySession />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;