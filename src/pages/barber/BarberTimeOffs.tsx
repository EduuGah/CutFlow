import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarOff, Clock, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Notice } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

interface TimeOff {
  id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
}

const emptyForm = { date: '', startTime: '', endTime: '', reason: '' };

export const BarberTimeOffs = () => {
  const { profile } = useAuth();
  const toast = useToast();

  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [removing, setRemoving] = useState<TimeOff | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const fetchTimeOffs = async () => {
    if (!profile) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from('time_offs')
      .select('*')
      .eq('barber_id', profile.id)
      .gte('end_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true });

    if (error) {
      console.error(error);
      toast.error('Não deu para carregar seus bloqueios.');
    } else {
      setTimeOffs((data as TimeOff[]) ?? []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTimeOffs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const openForm = () => {
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    const start = new Date(`${form.date}T${form.startTime}`);
    const end = new Date(`${form.date}T${form.endTime}`);

    if (end <= start) {
      setFormError('O término precisa ser depois do início.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const { error } = await supabase.from('time_offs').insert({
      barber_id: profile.id,
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString(),
      reason: form.reason || 'Bloqueio de agenda',
    });

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      setFormError('O bloqueio não foi salvo. Tente de novo.');
      return;
    }

    setIsFormOpen(false);
    toast.success('Bloqueio criado.');
    fetchTimeOffs();
  };

  const handleRemove = async () => {
    if (!removing) return;
    setIsRemoving(true);

    const { error } = await supabase.from('time_offs').delete().eq('id', removing.id);
    setIsRemoving(false);
    setRemoving(null);

    if (error) {
      console.error(error);
      toast.error('O bloqueio não foi removido.');
      return;
    }

    toast.success('Bloqueio removido.');
    fetchTimeOffs();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Ausências"
        title="Bloqueios de agenda"
        description="Horários em que você não atende. Eles somem da lista dos clientes na hora."
        actions={
          <Button onClick={openForm}>
            <Plus className="h-4 w-4" />
            Novo bloqueio
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card space-y-3 p-5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-6 w-24" rounded="rounded-md" />
            </div>
          ))}
        </div>
      ) : timeOffs.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="Nenhum bloqueio à frente"
          description="Sua agenda está toda liberada. Crie um bloqueio quando precisar fechar um período."
          action={
            <Button onClick={openForm}>
              <Plus className="h-4 w-4" />
              Novo bloqueio
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {timeOffs.map((timeOff, index) => {
            const start = parseISO(timeOff.start_datetime);
            const end = parseISO(timeOff.end_datetime);

            return (
              <li
                key={timeOff.id}
                className="card card-interactive anim-rise-sm flex items-start justify-between gap-4 p-5"
                style={{ ['--d' as string]: `${index * 70}ms` }}
              >
                <div className="min-w-0">
                  <p className="text-[0.9375rem] font-semibold text-ink capitalize">
                    {format(start, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>
                  <p className="type-num mt-1.5 flex items-center gap-2 text-sm text-smoke">
                    <Clock className="h-3.5 w-3.5" />
                    {format(start, 'HH:mm')} — {format(end, 'HH:mm')}
                  </p>
                  {timeOff.reason && <span className="pill pill-neutral mt-3">{timeOff.reason}</span>}
                </div>

                <button
                  type="button"
                  onClick={() => setRemoving(timeOff)}
                  className="icon-btn icon-btn-danger flex-none"
                  aria-label={`Remover bloqueio de ${format(start, "d 'de' MMMM", { locale: ptBR })}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Novo bloqueio */}
      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Bloquear horário"
        description="Escolha o período em que você não vai atender."
      >
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {formError && <Notice tone="error">{formError}</Notice>}

          <div>
            <label className="label" htmlFor="timeoff-date">
              Data
            </label>
            <input
              id="timeoff-date"
              type="date"
              required
              min={today}
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="timeoff-start">
                Início
              </label>
              <input
                id="timeoff-start"
                type="time"
                required
                value={form.startTime}
                onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="timeoff-end">
                Término
              </label>
              <input
                id="timeoff-end"
                type="time"
                required
                value={form.endTime}
                onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="timeoff-reason">
              Motivo (opcional)
            </label>
            <input
              id="timeoff-reason"
              type="text"
              placeholder="Almoço, médico, curso…"
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" block onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" block loading={isSubmitting} loadingLabel="Salvando">
              Salvar bloqueio
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remoção */}
      <Modal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Remover bloqueio"
        description="O período volta a ficar disponível para os clientes."
      >
        <div className="space-y-5 p-6">
          {removing && (
            <p className="rounded-xl bg-chalk px-4 py-3.5 text-sm text-graphite">
              <span className="capitalize">
                {format(parseISO(removing.start_datetime), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </span>
              , das {format(parseISO(removing.start_datetime), 'HH:mm')} às{' '}
              {format(parseISO(removing.end_datetime), 'HH:mm')}.
            </p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" block onClick={() => setRemoving(null)}>
              Manter bloqueio
            </Button>
            <Button variant="danger" block loading={isRemoving} onClick={handleRemove}>
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
