import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Scissors, LogOut, Calendar, Plus } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const CustomerLayout = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">CutFlow</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right mr-4">
              <p className="text-sm font-medium text-zinc-900">{profile?.full_name}</p>
              <p className="text-xs text-zinc-500">Cliente</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      
      {/* Mobile Bottom Navigation (Optional for future) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 pb-safe">
        <div className="flex items-center justify-around p-2">
          <NavLink
            to="/customer"
            end
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-lg text-xs font-medium ${
                isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
              }`
            }
          >
            <Calendar className="w-6 h-6 mb-1" />
            Início
          </NavLink>
        </div>
      </div>
    </div>
  );
};
