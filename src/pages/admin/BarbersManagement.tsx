import React, { useState, useEffect } from 'react';
import { Clock, Loader2, X, AlertCircle, Users } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { UserProfile, BarberSchedule } from '../../types';

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

interface ScheduleFormData {
  isActive: boolean;
  start_time: string;
  end_time: string;
  lunch_start: string;
  lunch_end: string;
}

const defaultScheduleForm: ScheduleFormData = {
  isActive: false,
  start_time: '09:00',
  end_time: '18:00',
  lunch_start: '12:00',
  lunch_end: '13:00'
};

export const BarbersManagement = () => {
  const [barbers, setBarbers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [selectedBarber, setSelectedBarber] = useState<UserProfile | null>(null);
  const [schedules, setSchedules] = useState<Record<number, ScheduleFormData>>({});

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'BARBER')
      .order('full_name');

    if (!error && data) {
      setBarbers(data as UserProfile[]);
    }
    setIsLoading(false);
  };

  const handleOpenSchedule = async (barber: UserProfile) => {
    setSelectedBarber(barber);
    setSaveError(null);
    setIsDrawerOpen(true);
    
    // Initialize default schedules
    const initialSchedules: Record<number, ScheduleFormData> = {};
    for (let i = 0; i < 7; i++) {
      initialSchedules[i] = { ...defaultScheduleForm, isActive: i !== 0 }; // Default Sunday closed
    }

    // Fetch existing schedules from DB
    const { data, error } = await supabase
      .from('barber_schedules')
      .select('*')
      .eq('barber_id', barber.id);

    if (!error && data) {
      data.forEach((sched: BarberSchedule) => {
        initialSchedules[sched.day_of_week] = {
          isActive: true,
          start_time: sched.start_time.slice(0, 5), // Format HH:mm
          end_time: sched.end_time.slice(0, 5),
          lunch_start: sched.lunch_start ? sched.lunch_start.slice(0, 5) : '',
          lunch_end: sched.lunch_end ? sched.lunch_end.slice(0, 5) : '',
        };
      });
    }

    setSchedules(initialSchedules);
  };

  const handleScheduleChange = (day: number, field: keyof ScheduleFormData, value: any) => {
    setSchedules(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarber) return;

    setIsSaving(true);
    setSaveError(null);

    // Prepare payload
    const payloadToInsert: Omit<BarberSchedule, 'id'>[] = [];
    
    for (let i = 0; i < 7; i++) {
      const dayData = schedules[i];
      if (dayData.isActive) {
        payloadToInsert.push({
          barber_id: selectedBarber.id,
          day_of_week: i,
          start_time: `${dayData.start_time}:00`,
          end_time: `${dayData.end_time}:00`,
          lunch_start: dayData.lunch_start ? `${dayData.lunch_start}:00` : null,
          lunch_end: dayData.lunch_end ? `${dayData.lunch_end}:00` : null,
        });
      }
    }

    // 1. Delete existing schedules for this barber
    const { error: deleteError } = await supabase
      .from('barber_schedules')
      .delete()
      .eq('barber_id', selectedBarber.id);

    if (deleteError) {
      console.error("Erro ao limpar agenda:", deleteError);
      setSaveError(deleteError.code === '42501' ? "Permissão negada (RLS)." : deleteError.message);
      setIsSaving(false);
      return;
    }

    // 2. Insert new active schedules
    if (payloadToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('barber_schedules')
        .insert(payloadToInsert);

      if (insertError) {
        console.error("Erro ao salvar agenda:", insertError);
        setSaveError(insertError.code === '42501' ? "Permissão negada (RLS)." : insertError.message);
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Barbeiros</h1>
          <p className="text-zinc-500 mt-1">Gerencie a equipe e defina os horários de atendimento</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : barbers.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-medium text-zinc-900">Nenhum barbeiro</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm">Ainda não existem usuários cadastrados com o perfil de Barbeiro no sistema.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Telefone</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {barbers.map((barber) => (
                <tr key={barber.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-zinc-900">{barber.full_name}</p>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{barber.email}</td>
                  <td className="px-6 py-4 text-zinc-600">{barber.phone || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenSchedule(barber)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      Horários
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer Overlay for Schedules */}
      {isDrawerOpen && selectedBarber && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-zinc-900/30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-zinc-200 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
                  Horários de Atendimento
                </h2>
                <p className="text-sm text-zinc-500 mt-0.5">{selectedBarber.full_name}</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <form id="schedule-form" onSubmit={handleSave} className="p-6 space-y-6">
                
                {saveError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{saveError}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {DAYS_OF_WEEK.map((dayName, index) => {
                    const dayData = schedules[index];
                    if (!dayData) return null;

                    return (
                      <div key={index} className={`p-4 rounded-xl border transition-colors ${dayData.isActive ? 'border-zinc-200 bg-white' : 'border-zinc-100 bg-zinc-50/50 opacity-60'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <label className="relative flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={dayData.isActive}
                              onChange={(e) => handleScheduleChange(index, 'isActive', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zinc-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
                            <span className="font-medium text-zinc-900">{dayName}</span>
                          </label>
                          {!dayData.isActive && (
                            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Fechado</span>
                          )}
                        </div>

                        {dayData.isActive && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-zinc-500">Início / Fim do dia</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  required={dayData.isActive}
                                  value={dayData.start_time}
                                  onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <span className="text-zinc-400">até</span>
                                <input
                                  type="time"
                                  required={dayData.isActive}
                                  value={dayData.end_time}
                                  onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-zinc-500">Pausa pro Almoço (opcional)</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={dayData.lunch_start}
                                  onChange={(e) => handleScheduleChange(index, 'lunch_start', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <span className="text-zinc-400">até</span>
                                <input
                                  type="time"
                                  value={dayData.lunch_end}
                                  onChange={(e) => handleScheduleChange(index, 'lunch_end', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-zinc-200 bg-zinc-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-2.5 px-4 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="schedule-form"
                disabled={isSaving}
                className="flex-1 py-2.5 px-4 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors flex justify-center items-center"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Horários'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
