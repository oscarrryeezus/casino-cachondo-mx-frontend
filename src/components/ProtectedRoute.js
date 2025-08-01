import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ redirectTo = '/' }) => {
  const { isAuthenticated, checkingSession } = useAuth();

  if (checkingSession) {
    return <div className="text-center py-5">Verificando sesion...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;