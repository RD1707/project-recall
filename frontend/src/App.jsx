// project-recall/src/App.jsx
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deck/:deckId" element={<DeckDetail />} />
        <Route path="/study/:deckId" element={<StudySession />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/ajuda" element={<Ajuda />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;