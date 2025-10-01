import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Componentes e Provedores
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner'; // Componente de loading
import { AchievementsProvider } from './context/AchievementsContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext'; // Importando o ThemeProvider

// Estilos globais
import './assets/css/base.css';
import './App.css';

// Lazy-loading das páginas (Code Splitting)
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DeckDetail = lazy(() => import('./pages/DeckDetail'));
const StudySession = lazy(() => import('./pages/StudySession'));
const Community = lazy(() => import('./pages/Community'));
const SharedDeck = lazy(() => import('./pages/SharedDeck'));
const Profile = lazy(() => import('./pages/Profile'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const Progress = lazy(() => import('./pages/Progress'));
const Ranking = lazy(() => import('./pages/Ranking'));
const EmailConfirmation = lazy(() => import('./pages/EmailConfirmation'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const Sobre = lazy(() => import('./pages/Sobre'));
const Contato = lazy(() => import('./pages/Contato'));
const Ajuda = lazy(() => import('./pages/Ajuda'));
const Termos = lazy(() => import('./pages/Termos'));
const Privacidade = lazy(() => import('./pages/Privacidade'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));
const QuizLobby = lazy(() => import('./pages/QuizLobby'));
const QuizGame = lazy(() => import('./pages/QuizGame'));

function App() {
  return (
    <ThemeProvider> {/* Envolvemos tudo com o ThemeProvider */}
      <Router>
        <SocketProvider>
          <AchievementsProvider>
            <div className="App">
              <Header />
              <main>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Rotas Públicas */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/email-confirmation" element={<EmailConfirmation />} />
                    <Route path="/verify-email" element={<EmailVerification />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/sobre" element={<Sobre />} />
                    <Route path="/contato" element={<Contato />} />
                    <Route path="/ajuda" element={<Ajuda />} />
                    <Route path="/termos" element={<Termos />} />
                    <Route path="/privacidade" element={<Privacidade />} />
                    <Route path="/api-docs" element={<ApiDocs />} />

                    {/* Rotas Protegidas */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/deck/:deckId" element={<ProtectedRoute><DeckDetail /></ProtectedRoute>} />
                    <Route path="/study/:deckId" element={<ProtectedRoute><StudySession /></ProtectedRoute>} />
                    <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                    <Route path="/deck/share/:shareId" element={<ProtectedRoute><SharedDeck /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/profile/:userId" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
                    <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                    <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
                    <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
                    <Route path="/quiz" element={<ProtectedRoute><QuizLobby /></ProtectedRoute>} />
                    <Route path="/quiz/:gameId" element={<ProtectedRoute><QuizGame /></ProtectedRoute>} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </AchievementsProvider>
        </SocketProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;