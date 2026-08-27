import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  // Se não estiver logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se a rota exige roles específicos e o usuário não possui a permissão
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redireciona para o lugar certo baseado na role
    switch (profile.role) {
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'BARBER':
        return <Navigate to="/barber" replace />;
      case 'CUSTOMER':
      default:
        return <Navigate to="/customer" replace />;
    }
  }

  return <Outlet />;
};
