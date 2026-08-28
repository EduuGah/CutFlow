import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Users, Scissors, Loader2, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface DashboardStats {
  appointmentsToday: number;
  activeBarbers: number;
  totalServices: number;
  revenueToday: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    appointmentsToday: 0,
    activeBarbers: 0,
    totalServices: 0,
    revenueToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const today = new Date();
      const start = startOfDay(today).toISOString();
      const end = endOfDay(today).toISOString();

      try {
        // Fetch appointments for today
        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, status, service:services(price)')
          .gte('start_datetime', start)
          .lte('start_datetime', end);

        // Fetch active barbers
        const { count: barbersCount } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'BARBER');

        // Fetch total services
        const { count: servicesCount } = await supabase
          .from('services')
          .select('id', { count: 'exact', head: true });

        const appointmentsToday = appointments?.length || 0;
        
        // Calculate revenue for completed/confirmed/in-progress
        let revenueToday = 0;
        if (appointments) {
          appointments.forEach(app => {
            if (app.status !== 'CANCELLED' && app.service && Array.isArray(app.service) === false) {
              revenueToday += Number((app.service as any).price || 0);
            }
          });
        }

        setStats({
          appointmentsToday,
          activeBarbers: barbersCount || 0,
          totalServices: servicesCount || 0,
          revenueToday
        });

      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Visão Geral</h1>
        <p className="text-zinc-500 mt-1">{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider">Atendimentos Hoje</p>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-zinc-900">{stats.appointmentsToday}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <span className="font-bold text-lg">R$</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider">Receita do Dia</p>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-zinc-900">
            {stats.revenueToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider">Barbeiros Ativos</p>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-zinc-900">{stats.activeBarbers}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider">Serviços Ativos</p>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-zinc-900">{stats.totalServices}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-2">Acesso Rápido</h2>
          <p className="text-sm text-zinc-500 mb-6">Gerencie sua equipe e os serviços oferecidos.</p>
          
          <div className="space-y-4">
            <NavLink to="/admin/barbers" className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-white transition-colors">
                  <Users className="w-6 h-6 text-zinc-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">Gerenciar Barbeiros</h3>
                  <p className="text-sm text-zinc-500">Adicionar, editar e remover profissionais.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
            </NavLink>

            <NavLink to="/admin/services" className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-white transition-colors">
                  <Scissors className="w-6 h-6 text-zinc-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">Catálogo de Serviços</h3>
                  <p className="text-sm text-zinc-500">Ajustar preços, durações e novos cortes.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
