import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeOff {
  id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
}

export const BarberTimeOffs = () => {
  const { profile } = useAuth();
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchTimeOffs = async () => {
    if (!profile) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('time_offs')
      .select('*')
      .eq('barber_id', profile.id)
      .gte('end_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true });

    if (data) {
      setTimeOffs(data as TimeOff[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTimeOffs();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !date || !startTime || !endTime) return;

    setError(null);
    setIsSubmitting(true);

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (end <= start) {
      setError('O horário final deve ser depois do inicial.');
      setIsSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('time_offs')
      .insert({
        barber_id: profile.id,
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        reason: reason || 'Bloqueio de agenda'
      });

    if (insertError) {
      setError('Erro ao salvar bloqueio. Tente novamente.');
    } else {
      setIsModalOpen(false);
      setDate('');
      setStartTime('');
      setEndTime('');
      setReason('');
      fetchTimeOffs();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este bloqueio?')) return;
    
    await supabase.from('time_offs').delete().eq('id', id);
    fetchTimeOffs();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Ausências e Bloqueios</h1>
          <p className="text-zinc-500 mt-1">Gerencie seus horários indisponíveis na agenda.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Bloqueio
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      ) : timeOffs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-zinc-200 rounded-3xl">
          <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-900">Nenhum bloqueio futuro</h3>
          <p className="text-zinc-500 mt-1">Sua agenda está totalmente liberada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {timeOffs.map((timeOff) => {
            const startDate = parseISO(timeOff.start_datetime);
            const endDate = parseISO(timeOff.end_datetime);
            
            return (
              <div key={timeOff.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 capitalize">
                    {format(startDate, 'EEEE, d \'de\' MMMM', { locale: ptBR })}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-zinc-600 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    <span>{format(startDate, 'HH:mm')} às {format(endDate, 'HH:mm')}</span>
                  </div>
                  {timeOff.reason && (
                    <div className="mt-3 inline-block px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-lg">
                      {timeOff.reason}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleDelete(timeOff.id)}
                  className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover Bloqueio"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Novo Bloqueio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h3 className="text-lg font-bold text-zinc-900">Bloquear Horário</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Início</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Término</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Motivo (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Almoço, Médico..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Bloqueio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
