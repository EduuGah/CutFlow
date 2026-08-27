import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminDashboard = () => {
  const { profile } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Painel Administrativo</h1>
      <p className="text-zinc-600">Bem-vindo(a), {profile?.full_name || 'Administrador'}!</p>
    </div>
  );
};
