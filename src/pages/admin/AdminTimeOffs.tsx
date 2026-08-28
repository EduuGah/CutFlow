import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarOff, Clock, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { UserProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Notice } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

interface TimeOff {
  id: string;
  barber_id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
  users?: { full_name: string } | null;
}

const emptyForm = {
  barberId: '',
  date: '',
  startTime: '',
  endTime: '',
  isFullDay: false,
  reason: '',
};

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export const AdminTimeOffs = () => {
  const toast = useToast();
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [barbers, setBarbers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [removing, setRemoving] = useState<TimeOff | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const [barbersRes, timeOffsRes] = await Promise.all([
      supabase.from('users').select('*').eq('role', 'BARBER').order('full_name'),
      supabase
        .from('time_offs')
        .select('*, users(full_name)')
        .gte('end_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true }),
    ]);

    if (barbersRes.data) setBarbers(barbersRes.data as UserProfile[]);
    if (timeOffsRes.error) {
      console.error(timeOffsRes.error);
      toast.error('Não deu para carregar os bloqueios.');
    } else {
      setTimeOffs((timeOffsRes.data as TimeOff[]) ?? []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openForm = () => {
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.barberId || !form.date) return;
    if (!form.isFullDay && (!form.startTime || !form.endTime)) {
      setFormError('Informe início e término, ou marque "dia inteiro".');
      return;
    }

    const start = new Date(`${form.date}T${form.isFullDay ? '00:00' : form.startTime}`);
    const end = new Date(`${form.date}T${form.isFullDay ? '23:59' : form.endTime}`);

    if (end <= start) {
      setFormError('O término precisa ser depois do início.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const targets = form.barberId === 'all' ? barbers.map((barber) => barber.id) : [form.barberId];
    const rows = targets.map((barberId) => ({
      barber_id: barberId,
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString(),
      reason: form.reason || 'Bloqueio administrativo',
    }));

    const { error } = await supabase.from('time_offs').insert(rows);
    setIsSubmitting(false);

    if (error) {
      console.error(error);
      setFormError(
        'O bloqueio não foi salvo. Confirme se as políticas de acesso da tabela time_offs estão configuradas.'
      );
      return;
    }

    setIsFormOpen(false);
    toast.success(
      rows.length > 1 ? `Bloqueio criado para ${rows.length} profissionais.` : 'Bloqueio criado.'
    );
    fetchData();
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
    fetchData();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Bloqueios"
        title="Folgas e fechamentos"
        description="Feriados, férias e ausências. O período sai da agenda dos clientes na hora."
        actions={
          <Button onClick={openForm}>
            <Plus className="h-4 w-4" />
            Novo bloqueio
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : timeOffs.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="Nenhum bloqueio à frente"
          description="A agenda de toda a equipe está liberada. Crie um bloqueio para fechar um período."
          action={
            <Button onClick={openForm}>
              <Plus className="h-4 w-4" />
              Novo bloqueio
            </Button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden border-b border-line bg-chalk/60 px-5 py-3 sm:grid sm:grid-cols-[1fr_12rem_1fr_3rem] sm:gap-4">
            {['Profissional', 'Período', 'Motivo', ''].map((heading, index) => (
              <span key={index} className="type-tag text-ash">
                {heading}
              </span>
            ))}
          </div>

          <ul className="divide-y divide-line-soft">
            {timeOffs.map((timeOff, index) => {
              const start = parseISO(timeOff.start_datetime);
              const end = parseISO(timeOff.end_datetime);
              const name = timeOff.users?.full_name ?? 'Profissional removido';

              return (
                <li
                  key={timeOff.id}
                  className="anim-rise-sm grid gap-3 px-5 py-4 transition-colors hover:bg-chalk/40 sm:grid-cols-[1fr_12rem_1fr_3rem] sm:items-center sm:gap-4"
                  style={{ ['--d' as string]: `${index * 45}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-chalk text-xs font-bold text-smoke">
                      {initials(name)}
                    </span>
                    <span className="truncate text-sm font-medium text-ink">{name}</span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-ink capitalize">
                      {format(start, "d 'de' MMM", { locale: ptBR })}
                    </p>
                    <p className="type-num mt-0.5 flex items-center gap-1.5 text-xs text-smoke">
                      <Clock className="h-3 w-3" />
                      {format(start, 'HH:mm')} — {format(end, 'HH:mm')}
                    </p>
                  </div>

                  <p className="text-sm text-smoke">{timeOff.reason}</p>

                  <button
                    type="button"
                    onClick={() => setRemoving(timeOff)}
                    className="icon-btn icon-btn-danger justify-self-start sm:justify-self-end"
                    aria-label={`Remover bloqueio de ${name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Novo bloqueio */}
      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Novo bloqueio"
        description="Defina quem fica indisponível e por quanto tempo."
      >
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {formError && <Notice tone="error">{formError}</Notice>}

          <div>
            <label className="label" htmlFor="block-barber">
              Para quem
            </label>
            <select
              id="block-barber"
              required
              value={form.barberId}
              onChange={(event) => setForm({ ...form, barberId: event.target.value })}
              className="input"
            >
              <option value="" disabled>
                Selecione um profissional
              </option>
              <option value="all">Toda a equipe (fechamento geral)</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="block-date">
              Data
            </label>
            <input
              id="block-date"
              type="date"
              required
              min={today}
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              className="input"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-4">
            <input
              type="checkbox"
              checked={form.isFullDay}
              onChange={(event) => setForm({ ...form, isFullDay: event.target.checked })}
              className="switch-input sr-only"
            />
            <span className="switch-track" aria-hidden="true" />
            <span className="text-sm font-semibold text-ink">Dia inteiro</span>
          </label>

          {!form.isFullDay && (
            <div className="anim-rise-sm grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="block-start">
                  Início
                </label>
                <input
                  id="block-start"
                  type="time"
                  required
                  value={form.startTime}
                  onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                  className="input type-num"
                />
              </div>
              <div>
                <label className="label" htmlFor="block-end">
                  Término
                </label>
                <input
                  id="block-end"
                  type="time"
                  required
                  value={form.endTime}
                  onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                  className="input type-num"
                />
              </div>
            </div>
          )}

          <div>
            <label className="label" htmlFor="block-reason">
              Motivo (opcional)
            </label>
            <input
              id="block-reason"
              type="text"
              placeholder="Feriado, férias, manutenção…"
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
              Criar bloqueio
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remoção */}
      <Modal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Remover bloqueio"
        description="O período volta a aceitar agendamentos."
      >
        <div className="space-y-5 p-6">
          {removing && (
            <p className="rounded-xl bg-chalk px-4 py-3.5 text-sm text-graphite">
              {removing.users?.full_name ?? 'Profissional'} —{' '}
              <span className="capitalize">
                {format(parseISO(removing.start_datetime), "d 'de' MMMM", { locale: ptBR })}
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
