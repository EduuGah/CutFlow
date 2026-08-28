import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Scissors, User, Loader2, CheckCircle2 } from 'lucide-react';

interface AppointmentData {
  id: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  barber: { full_name: string };
  service: { name: string; price: number; duration_minutes: number };
}

export const CustomerAppointments = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_datetime,
          end_datetime,
          status,
          barber:users!barber_id(full_name),
          service:services!service_id(name, price, duration_minutes)
        `)
        .eq('customer_id', profile.id)
        .order('start_datetime', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
      } else if (data) {
        setAppointments(data as unknown as AppointmentData[]);
      }

      setIsLoading(false);
    };

    fetchAppointments();
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const upcoming = appointments.filter(a => new Date(a.start_datetime) >= new Date() && a.status !== 'CANCELLED');
  const past = appointments.filter(a => new Date(a.start_datetime) < new Date() || a.status === 'CANCELLED');

  const AppointmentCard = ({ appointment, isPast = false }: { appointment: AppointmentData, isPast?: boolean }) => {
    const date = new Date(appointment.start_datetime);
    
    return (
      <div className={`bg-white border rounded-3xl p-6 ${isPast ? 'border-zinc-200/60 opacity-75' : 'border-zinc-200 shadow-sm'}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-zinc-50 text-zinc-400' : 'bg-zinc-900 text-white'}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className={`font-semibold capitalize ${isPast ? 'text-zinc-600' : 'text-zinc-900'}`}>
                {date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </p>
              <p className={`text-sm font-medium flex items-center gap-1.5 mt-0.5 ${isPast ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <Clock className="w-4 h-4" />
                {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          {appointment.status === 'CANCELLED' ? (
            <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full uppercase tracking-wider">
              Cancelado
            </span>
          ) : isPast ? (
            <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-xs font-semibold rounded-full uppercase tracking-wider">
              Concluído
            </span>
          ) : (
            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirmado
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-100">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-zinc-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Profissional</p>
              <p className="text-sm font-medium text-zinc-900">{appointment.barber?.full_name}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Scissors className="w-5 h-5 text-zinc-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Serviço</p>
              <p className="text-sm font-medium text-zinc-900">{appointment.service?.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{appointment.service?.duration_minutes} min</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Meus Agendamentos</h1>
        <p className="text-zinc-500 mt-1">Acompanhe seus horários marcados e histórico.</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white border border-zinc-200 rounded-3xl">
          <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-600 font-medium">Você ainda não tem nenhum agendamento.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Próximos Horários</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcoming.map(app => (
                  <AppointmentCard key={app.id} appointment={app} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Histórico</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {past.map(app => (
                  <AppointmentCard key={app.id} appointment={app} isPast={true} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
