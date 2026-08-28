import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Plus, Trash2, Loader2, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserProfile } from '../../types';

interface TimeOff {
  id: string;
  barber_id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
  users?: { full_name: string };
}

export const AdminTimeOffs = () => {
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [barbers, setBarbers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<string>(''); // 'all' or specific UUID
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isFullDay, setIsFullDay] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch barbers for the select
    const { data: barbersData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'BARBER')
      .order('full_name', { ascending: true });

    if (barbersData) {
      setBarbers(barbersData as UserProfile[]);
    }

    // Fetch future time_offs
    const { data: timeOffsData } = await supabase
      .from('time_offs')
      .select('*, users(full_name)')
      .gte('end_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true });

    if (timeOffsData) {
      setTimeOffs(timeOffsData as TimeOff[]);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarberId || !date) return;
    
    if (!isFullDay && (!startTime || !endTime)) {
      setError('Informe o horário de início e fim, ou marque "Dia inteiro".');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const start = new Date(`${date}T${isFullDay ? '00:00' : startTime}`);
    const end = new Date(`${date}T${isFullDay ? '23:59' : endTime}`);

    if (end <= start) {
      setError('O horário final deve ser depois do inicial.');
      setIsSubmitting(false);
      return;
    }

    // Prepara os dados para inserir. Pode ser um único ou todos.
    const barberIdsToBlock = selectedBarberId === 'all' 
      ? barbers.map(b => b.id) 
      : [selectedBarberId];

    const inserts = barberIdsToBlock.map(id => ({
      barber_id: id,
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString(),
      reason: reason || 'Bloqueio administrativo'
    }));

    const { error: insertError } = await supabase
      .from('time_offs')
      .insert(inserts);

    if (insertError) {
      // Possible RLS error if admin policies are missing
      setError('Erro ao salvar bloqueio. Verifique se o script SQL foi executado.');
      console.error(insertError);
    } else {
      setIsModalOpen(false);
      resetForm();
      fetchData();
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setSelectedBarberId('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setIsFullDay(false);
    setReason('');
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este bloqueio?')) return;
    
    await supabase.from('time_offs').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Bloqueios e Folgas</h1>
          <p className="text-zinc-500 mt-1">Gerencie ausências de barbeiros e fechamentos gerais.</p>
        </div>
        
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
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
          <h3 className="text-lg font-bold text-zinc-900">Nenhum bloqueio registrado</h3>
          <p className="text-zinc-500 mt-1">A agenda de todos os barbeiros está liberada.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Profissional</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Período</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {timeOffs.map((timeOff) => {
                  const start = parseISO(timeOff.start_datetime);
                  const end = parseISO(timeOff.end_datetime);
                  return (
                    <tr key={timeOff.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-zinc-500" />
                          </div>
                          <span className="text-sm font-medium text-zinc-900">
                            {timeOff.users?.full_name || 'Desconhecido'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-900">
                          <Calendar className="w-4 h-4 text-zinc-400" />
                          <span className="font-medium">{format(start, "dd 'de' MMM", { locale: ptBR })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-600">{timeOff.reason}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(timeOff.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                          title="Remover bloqueio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900">Novo Bloqueio</h2>
              <p className="text-sm text-zinc-500 mt-1">Defina quando não haverá atendimento</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Para quem?</label>
                  <select
                    required
                    value={selectedBarberId}
                    onChange={(e) => setSelectedBarberId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                  >
                    <option value="" disabled>Selecione...</option>
                    <option value="all">TODOS os Barbeiros (Fechamento Geral)</option>
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>{b.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFullDay"
                    checked={isFullDay}
                    onChange={(e) => setIsFullDay(e.target.checked)}
                    className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                  />
                  <label htmlFor="isFullDay" className="text-sm font-medium text-zinc-700">
                    Dia inteiro (00:00 às 23:59)
                  </label>
                </div>

                {!isFullDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Início</label>
                      <input
                        type="time"
                        required={!isFullDay}
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Fim</label>
                      <input
                        type="time"
                        required={!isFullDay}
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Motivo</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Feriado, Férias, Manutenção..."
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-white border border-zinc-200 text-zinc-700 font-medium rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
