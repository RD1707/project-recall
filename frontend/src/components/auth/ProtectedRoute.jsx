import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

function ProtectedRoute({ children }) {
  const { isAuthenticated, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const needsProfileCompletion = (!profile || !profile.username) && location.pathname !== '/complete-profile';
  if (needsProfileCompletion) {
    return <Navigate to="/complete-profile" replace />;
  }

  const hasProfileButOnCompleteProfilePage = profile?.username && location.pathname === '/complete-profile';
  if (hasProfileButOnCompleteProfilePage) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;