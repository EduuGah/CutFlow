import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Scissors, User, ChevronLeft, ChevronRight, Loader2, Star } from 'lucide-react';
import { AppointmentStatus } from '../../types';

interface AdminAppointment {
  id: string;
  start_datetime: string;
  end_datetime: string;
  status: AppointmentStatus;
  customer: { full_name: string; phone: string | null };
  barber: { full_name: string };
  service: { name: string; price: number; duration_minutes: number };
  review?: { id: string; rating: number; comment: string | null }[] | any;
}

export const AdminSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgenda = async (date: Date) => {

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
        barber:users!barber_id(full_name),
        service:services!service_id(name, price, duration_minutes),
        review:reviews(id, rating, comment)
      `)
      .gte('start_datetime', startOfDay.toISOString())
      .lte('start_datetime', endOfDay.toISOString())
      .order('start_datetime', { ascending: true });

    if (!error && data) {
      // Cast the data appropriately as the joins return arrays or single objects based on the schema
      setAppointments(data as unknown as AdminAppointment[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAgenda(currentDate);
  }, [currentDate]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days = [];
    const firstDayOfWeek = firstDayOfMonth.getDay(); 
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const prevMonth = () => setCurrentMonth(subDays(currentMonth, currentMonth.getDate()));
  const nextMonth = () => setCurrentMonth(addDays(currentMonth, 32 - currentMonth.getDate()));

  const formatMonthYear = (date: Date) => {
    return format(date, "MMMM 'de' yyyy", { locale: ptBR });
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">Confirmado</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Em Andamento</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Concluído</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Cancelado</span>;
      default:
        return null;
    }
  };

  // Group appointments by barber
  const groupedAppointments = appointments.reduce((acc, app) => {
    // Supabase joins with '!' might return arrays if not one-to-one, but assuming one-to-one here
    const barberName = Array.isArray(app.barber) ? app.barber[0]?.full_name : app.barber?.full_name;
    const name = barberName || 'Barbeiro Desconhecido';
    if (!acc[name]) acc[name] = [];
    acc[name].push(app);
    return acc;
  }, {} as Record<string, AdminAppointment[]>);

  const barbers = Object.keys(groupedAppointments).sort();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Date Navigation */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Agenda Geral</h1>
          <p className="text-zinc-500 mt-1">Visão completa dos agendamentos de toda a equipe</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-zinc-900 capitalize">{formatMonthYear(currentMonth)}</h3>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-1.5 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors text-sm font-medium"
              >
                Hoje
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-y-4 gap-x-1 sm:gap-x-2 text-center mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {generateCalendarDays().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-10 sm:h-12" />;
              }
              
              const isSelected = isSameDay(currentDate, date);
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentDate(date)}
                  className={`h-10 sm:h-12 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-zinc-900 text-white shadow-md'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agenda Content */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">Nenhum agendamento</h3>
          <p className="text-sm text-zinc-500 mt-1">Nenhum serviço marcado para esta data.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {barbers.map(barberName => (
            <div key={barberName} className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                <User className="w-5 h-5 text-zinc-400" />
                {barberName}
                <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full ml-2">
                  {groupedAppointments[barberName].length} agendamentos
                </span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {groupedAppointments[barberName].map(app => {
                  const startDate = new Date(app.start_datetime);
                  const endDate = new Date(app.end_datetime);
                  const service = Array.isArray(app.service) ? app.service[0] : app.service;
                  const customer = Array.isArray(app.customer) ? app.customer[0] : app.customer;

                  return (
                    <div
                      key={app.id}
                      className={`bg-white border rounded-2xl p-4 transition-all flex flex-col gap-4 ${
                        app.status === 'CANCELLED' ? 'border-zinc-200/60 opacity-60' : 
                        app.status === 'COMPLETED' ? 'border-zinc-200 bg-zinc-50/50' : 
                        app.status === 'IN_PROGRESS' ? 'border-blue-300 ring-4 ring-blue-50 shadow-md' :
                        'border-zinc-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                            app.status === 'CANCELLED' ? 'bg-zinc-100 text-zinc-400' :
                            app.status === 'IN_PROGRESS' ? 'bg-blue-600 text-white' :
                            'bg-zinc-900 text-white'
                          }`}>
                            {format(startDate, 'HH:mm')}
                          </div>
                          {getStatusBadge(app.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 text-zinc-600">
                            <User className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-zinc-900">{customer?.full_name}</p>
                              {customer?.phone && (
                                <p className="text-xs text-zinc-500">{customer.phone}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start gap-2 text-zinc-600">
                            <Scissors className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-zinc-900">{service?.name}</p>
                              <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {service?.duration_minutes} min
                                </span>
                                <span>•</span>
                                <span>R$ {Number(service?.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </div>
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
