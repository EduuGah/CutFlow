import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const BarberDashboard = () => {
  const { profile } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Agenda do Barbeiro</h1>
      <p className="text-zinc-600">Bem-vindo(a), {profile?.full_name || 'Barbeiro'}!</p>
    </div>
  );
};
