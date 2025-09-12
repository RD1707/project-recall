import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';

// Páginas que sempre carregam (críticas)
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy loading para páginas menos críticas
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Ajuda = lazy(() => import('./pages/Ajuda'));
const Sobre = lazy(() => import('./pages/Sobre'));
const Contato = lazy(() => import('./pages/Contato'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));
const Privacidade = lazy(() => import('./pages/Privacidade'));
const Termos = lazy(() => import('./pages/Termos'));
const SharedDeck = lazy(() => import('./pages/SharedDeck'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DeckDetail = lazy(() => import('./pages/DeckDetail'));
const StudySession = lazy(() => import('./pages/StudySession'));
const Progress = lazy(() => import('./pages/Progress'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const Ranking = lazy(() => import('./pages/Ranking'));
const QuizLobby = lazy(() => import('./pages/QuizLobby'));
const QuizGame = lazy(() => import('./pages/QuizGame'));
const Community = lazy(() => import('./pages/Community'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));

import ProtectedRoute from './components/auth/ProtectedRoute';
import CookieBanner from './components/common/CookieBanner';
import LoadingSpinner from './components/common/LoadingSpinner';
import { SocketProvider } from './context/SocketContext';
import { AchievementsProvider } from './context/AchievementsContext';


// Componente para fallback de erro
function ErrorFallback({ error, resetErrorBoundary }) {
  console.error('Application Error:', error);
  
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h2>Algo deu errado</h2>
      <p>Ocorreu um erro inesperado. Nosso time foi notificado.</p>
      <button 
        onClick={resetErrorBoundary}
        style={{ 
          padding: '0.75rem 1.5rem', 
          marginTop: '1rem',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}
      >
        Tentar Novamente
      </button>
      <button 
        onClick={() => window.location.href = '/'}
        style={{ 
          padding: '0.75rem 1.5rem', 
          marginTop: '0.5rem',
          backgroundColor: 'transparent',
          color: '#4f46e5',
          border: '1px solid #4f46e5',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}
      >
        Ir para Início
      </button>
    </div>
  );
}

// Componente de loading personalizado
function AppSuspenseFallback() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <LoadingSpinner />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log erro para serviço de monitoramento
        console.error('React Error Boundary:', error, errorInfo);
        
        // Em produção, enviar para serviço de monitoramento
        if (process.env.NODE_ENV === 'production') {
          // Exemplo: Sentry.captureException(error);
        }
      }}
      onReset={() => {
        // Limpar estado da aplicação se necessário
        window.location.reload();
      }}
    >
      <SocketProvider>
        <AchievementsProvider>
          <BrowserRouter>
            <CookieBanner />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
            
            <Suspense fallback={<AppSuspenseFallback />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
                
                {/* Catch all route - deve ser a última */}
                <Route path="*" element={
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <h2>Página não encontrada</h2>
                    <p>A página que você está procurando não existe.</p>
                    <button 
                      onClick={() => window.location.href = '/'}
                      style={{ 
                        padding: '0.75rem 1.5rem', 
                        marginTop: '1rem',
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                      }}
                    >
                      Voltar ao Início
                    </button>
                  </div>
                } />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AchievementsProvider>
      </SocketProvider>
    </ErrorBoundary>
  );
}

export default App;