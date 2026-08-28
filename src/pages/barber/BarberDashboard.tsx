import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Scissors, User, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Loader2, Play, Undo2, Star } from 'lucide-react';
import { AppointmentStatus } from '../../types';

interface DailyAppointment {
  id: string;
  start_datetime: string;
  end_datetime: string;
  status: AppointmentStatus;
  customer: { full_name: string; phone: string | null };
  service: { name: string; price: number; duration_minutes: number };
  review?: { id: string; rating: number; comment: string | null }[] | any;
}

export const BarberDashboard = () => {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<DailyAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const fetchAgenda = async (date: Date) => {
    if (!profile) return;
    setIsLoading(true);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_datetime,
        end_datetime,
        status,
        customer:users!customer_id(full_name, phone),
        service:services!service_id(name, price, duration_minutes),
        review:reviews(id, rating, comment)
      `)
      .eq('barber_id', profile.id)
      .gte('start_datetime', startOfDay.toISOString())
      .lte('start_datetime', endOfDay.toISOString())
      .order('start_datetime', { ascending: true });

    if (!error && data) {
      setAppointments(data as unknown as DailyAppointment[]);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAgenda(currentDate);
  }, [currentDate, profile]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    setIsUpdating(appointmentId);
    
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (!error) {
      setAppointments(prev => 
        prev.map(app => app.id === appointmentId ? { ...app, status: newStatus } : app)
      );
    } else {
      alert('Erro ao atualizar status do agendamento.');
    }
    
    setIsUpdating(null);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-md uppercase tracking-wider">Aguardando</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md uppercase tracking-wider">Em Andamento</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-md uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Concluído</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-md uppercase tracking-wider flex items-center gap-1"><XCircle className="w-3.5 h-3.5"/> Cancelado</span>;
    }
  };

  const totalRevenue = appointments
    .filter(a => a.status === 'COMPLETED' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS')
    .reduce((acc, curr) => acc + Number(curr.service.price), 0);

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Agenda do Dia</h1>
          <p className="text-zinc-500 mt-1">Olá, {profile?.full_name?.split(' ')[0]}. Aqui estão seus compromissos.</p>
        </div>

        <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-2xl p-1.5 shadow-sm">
          <button 
            onClick={() => setCurrentDate(prev => subDays(prev, 1))}
            className="p-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="min-w-[140px] text-center flex flex-col justify-center">
            <span className="text-sm font-semibold text-zinc-900 capitalize">
              {isSameDay(currentDate, new Date()) ? 'Hoje' : format(currentDate, 'EEEE', { locale: ptBR })}
            </span>
            <span className="text-xs text-zinc-500">
              {format(currentDate, "d 'de' MMMM", { locale: ptBR })}
            </span>
          </div>

          <button 
            onClick={() => setCurrentDate(prev => addDays(prev, 1))}
            className="p-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Total Hoje</p>
          <p className="text-2xl font-bold text-zinc-900">{appointments.length}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Concluídos</p>
          <p className="text-2xl font-bold text-zinc-900">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm md:col-span-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Previsão de Receita</p>
          <p className="text-2xl font-bold text-zinc-900">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-12 bg-white border border-zinc-200 rounded-3xl">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 bg-white border border-zinc-200 rounded-3xl border-dashed">
            <CalendarIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 mb-1">Agenda Livre</h3>
            <p className="text-zinc-500">Nenhum cliente agendado para este dia.</p>
          </div>
        ) : (
          appointments.map((app) => {
            const startDate = new Date(app.start_datetime);
            const endDate = new Date(app.end_datetime);
            const isPast = endDate < new Date() && app.status === 'CONFIRMED';

            return (
              <div 
                key={app.id} 
                className={`bg-white border rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center gap-6 ${
                  app.status === 'CANCELLED' ? 'border-zinc-200/60 opacity-60' : 
                  app.status === 'COMPLETED' ? 'border-zinc-200 bg-zinc-50/50' : 
                  app.status === 'IN_PROGRESS' ? 'border-blue-300 ring-4 ring-blue-50 shadow-md' :
                  'border-zinc-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Time Block */}
                <div className="flex items-center gap-4 md:w-48 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    app.status === 'CANCELLED' ? 'bg-zinc-100 text-zinc-400' :
                    app.status === 'IN_PROGRESS' ? 'bg-blue-600 text-white' :
                    'bg-zinc-900 text-white'
                  }`}>
                    {format(startDate, 'HH:mm')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      até {format(endDate, 'HH:mm')}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{app.service.duration_minutes} min</p>
                  </div>
                </div>

                {/* Info Block */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Cliente
                      </p>
                      <p className="text-base font-semibold text-zinc-900">{app.customer.full_name}</p>
                      {app.customer.phone && (
                        <p className="text-sm text-zinc-500">{app.customer.phone}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5" /> Serviço
                      </p>
                      <p className="text-base font-semibold text-zinc-900">{app.service.name}</p>
                      <p className="text-sm font-medium text-zinc-500">
                        R$ {Number(app.service.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Review Section */}
                  {(() => {
                    const existingReview = Array.isArray(app.review) ? app.review[0] : app.review;
                    if (app.status === 'COMPLETED' && existingReview) {
                      return (
                        <div className="mt-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Avaliação do Cliente</p>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3.5 h-3.5 ${star <= existingReview.rating ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'}`} />
                              ))}
                            </div>
                          </div>
                          {existingReview.comment && (
                            <p className="text-sm text-zinc-700 italic">"{existingReview.comment}"</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Actions & Status */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-4 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6 w-full md:w-48 flex-shrink-0">
                  {getStatusBadge(app.status)}
                  
                  {app.status === 'CONFIRMED' && confirmCancelId !== app.id && (
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                      <button
                        onClick={() => setConfirmCancelId(app.id)}
                        disabled={isUpdating === app.id}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Cancelar Agendamento"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'IN_PROGRESS')}
                        disabled={isUpdating === app.id}
                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Iniciar Atendimento"
                      >
                        {isUpdating === app.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                        disabled={isUpdating === app.id}
                        className="px-3 py-1.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isUpdating === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Concluir
                      </button>
                    </div>
                  )}

                  {confirmCancelId === app.id && (
                    <div className="flex flex-wrap items-center gap-2 animate-in fade-in zoom-in-95 duration-200 bg-red-50 p-2 rounded-lg border border-red-100 w-full sm:w-auto justify-start sm:justify-end">
                      <span className="text-xs font-semibold text-red-700 mx-1">Cancelar?</span>
                      <button
                        onClick={() => setConfirmCancelId(null)}
                        className="px-2 py-1 bg-white border border-red-200 text-zinc-600 text-xs font-medium rounded hover:bg-zinc-50 transition-colors"
                      >
                        Não
                      </button>
                      <button
                        onClick={() => {
                          handleUpdateStatus(app.id, 'CANCELLED');
                          setConfirmCancelId(null);
                        }}
                        disabled={isUpdating === app.id}
                        className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isUpdating === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sim'}
                      </button>
                    </div>
                  )}

                  {app.status === 'IN_PROGRESS' && (
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                        disabled={isUpdating === app.id}
                        className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Desfazer"
                      >
                        {isUpdating === app.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Undo2 className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                        disabled={isUpdating === app.id}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isUpdating === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Concluir
                      </button>
                    </div>
                  )}

                  {(app.status === 'COMPLETED' || app.status === 'CANCELLED') && (
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                        disabled={isUpdating === app.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 text-zinc-600 text-xs font-medium rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
                        title="Desfazer ação"
                      >
                        {isUpdating === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
                        Desfazer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

