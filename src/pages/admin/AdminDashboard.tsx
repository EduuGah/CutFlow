import React from 'react';

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Visão geral da barbearia</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-zinc-500">Agendamentos Hoje</p>
          <p className="text-3xl font-bold text-zinc-900 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-zinc-500">Barbeiros Ativos</p>
          <p className="text-3xl font-bold text-zinc-900 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-zinc-500">Serviços Cadastrados</p>
          <p className="text-3xl font-bold text-zinc-900 mt-2">0</p>
        </div>
      </div>
    </div>
  );
};
