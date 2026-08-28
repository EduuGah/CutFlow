import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Users } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { BarberSchedule, UserProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Notice } from '../../components/ui/Field';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

const DAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const DAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

interface DayForm {
  isActive: boolean;
  start_time: string;
  end_time: string;
  lunch_start: string;
  lunch_end: string;
}

const DEFAULT_DAY: DayForm = {
  isActive: false,
  start_time: '09:00',
  end_time: '18:00',
  lunch_start: '12:00',
  lunch_end: '13:00',
};

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export const BarbersManagement = () => {
  const toast = useToast();
  const [barbers, setBarbers] = useState<UserProfile[]>([]);
  const [allSchedules, setAllSchedules] = useState<BarberSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<UserProfile | null>(null);
  const [days, setDays] = useState<Record<number, DayForm>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const [barbersRes, schedulesRes] = await Promise.all([
      supabase.from('users').select('*').eq('role', 'BARBER').order('full_name'),
      supabase.from('barber_schedules').select('*'),
    ]);

    if (barbersRes.error) {
      console.error(barbersRes.error);
      toast.error('Não deu para carregar a equipe.');
    } else {
      setBarbers((barbersRes.data as UserProfile[]) ?? []);
    }
    setAllSchedules((schedulesRes.data as BarberSchedule[]) ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const workdaysByBarber = useMemo(() => {
    const map = new Map<string, Set<number>>();
    allSchedules.forEach((schedule) => {
      const set = map.get(schedule.barber_id) ?? new Set<number>();
      set.add(schedule.day_of_week);
      map.set(schedule.barber_id, set);
    });
    return map;
  }, [allSchedules]);

  const openSchedule = async (barber: UserProfile) => {
    setSelectedBarber(barber);
    setSaveError(null);
    setIsDrawerOpen(true);

    const draft: Record<number, DayForm> = {};
    for (let day = 0; day < 7; day += 1) {
      draft[day] = { ...DEFAULT_DAY, isActive: day !== 0 };
    }

    const { data } = await supabase
      .from('barber_schedules')
      .select('*')
      .eq('barber_id', barber.id);

    (data as BarberSchedule[] | null)?.forEach((schedule) => {
      draft[schedule.day_of_week] = {
        isActive: true,
        start_time: schedule.start_time.slice(0, 5),
        end_time: schedule.end_time.slice(0, 5),
        lunch_start: schedule.lunch_start ? schedule.lunch_start.slice(0, 5) : '',
        lunch_end: schedule.lunch_end ? schedule.lunch_end.slice(0, 5) : '',
      };
    });

    setDays(draft);
  };

  const updateDay = (day: number, patch: Partial<DayForm>) =>
    setDays((current) => ({ ...current, [day]: { ...current[day], ...patch } }));

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBarber) return;

    setIsSaving(true);
    setSaveError(null);

    const rows: Omit<BarberSchedule, 'id'>[] = [];
    for (let day = 0; day < 7; day += 1) {
      const entry = days[day];
      if (!entry?.isActive) continue;
      rows.push({
        barber_id: selectedBarber.id,
        day_of_week: day,
        start_time: `${entry.start_time}:00`,
        end_time: `${entry.end_time}:00`,
        lunch_start: entry.lunch_start ? `${entry.lunch_start}:00` : null,
        lunch_end: entry.lunch_end ? `${entry.lunch_end}:00` : null,
      });
    }

    // A semana é regravada inteira: apaga o que existe e insere o novo desenho.
    const { error: deleteError } = await supabase
      .from('barber_schedules')
      .delete()
      .eq('barber_id', selectedBarber.id);

    if (deleteError) {
      console.error(deleteError);
      setSaveError(
        deleteError.code === '42501'
          ? 'O banco recusou a alteração (RLS). Configure as políticas da tabela barber_schedules.'
          : deleteError.message
      );
      setIsSaving(false);
      return;
    }

    if (rows.length > 0) {
      const { error: insertError } = await supabase.from('barber_schedules').insert(rows);
      if (insertError) {
        console.error(insertError);
        setSaveError(
          insertError.code === '42501'
            ? 'O banco recusou a gravação (RLS). Configure as políticas da tabela barber_schedules.'
            : insertError.message
        );
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    setIsDrawerOpen(false);
    toast.success(`Horários de ${selectedBarber.full_name.split(' ')[0]} atualizados.`);
    fetchData();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Equipe"
        title="Barbeiros"
        description="Quem atende na casa e em quais dias e horários cada um trabalha."
      />

      {isLoading ? (
        <TableSkeleton rows={3} cols={3} />
      ) : barbers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum barbeiro cadastrado"
          description="Peça para o profissional criar a conta escolhendo o perfil Barbeiro. Ele aparece aqui em seguida."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {barbers.map((barber, index) => {
            const workdays = workdaysByBarber.get(barber.id) ?? new Set<number>();

            return (
              <li
                key={barber.id}
                className="card card-interactive anim-rise-sm flex flex-col gap-4 p-5"
                style={{ ['--d' as string]: `${index * 60}ms` }}
              >
                <div className="flex items-start gap-3.5">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-pine text-sm font-bold text-white">
                    {initials(barber.full_name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.9375rem] font-semibold text-ink">
                      {barber.full_name}
                    </p>
                    <p className="truncate text-sm text-smoke">{barber.email}</p>
                    {barber.phone && (
                      <p className="type-num mt-0.5 text-xs text-ash">{barber.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-line-soft pt-4">
                  <div>
                    <p className="type-tag text-ash">Dias de trabalho</p>
                    <div className="mt-2 flex gap-1" aria-label={`${workdays.size} dias por semana`}>
                      {DAY_INITIALS.map((letter, day) => (
                        <span
                          key={day}
                          title={DAYS[day]}
                          className={`type-num flex h-6 w-6 items-center justify-center rounded text-[0.6875rem] ${
                            workdays.has(day)
                              ? 'bg-pine-wash text-pine'
                              : 'bg-chalk text-ash/60'
                          }`}
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => openSchedule(barber)}>
                    <Clock className="h-4 w-4" />
                    Horários
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Horários de atendimento"
        subtitle={selectedBarber?.full_name}
        width="max-w-2xl"
        footer={
          <>
            <Button variant="outline" block onClick={() => setIsDrawerOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="schedule-form"
              block
              loading={isSaving}
              loadingLabel="Salvando"
            >
              Salvar horários
            </Button>
          </>
        }
      >
        <form id="schedule-form" onSubmit={handleSave} className="space-y-3 p-6">
          {saveError && <Notice tone="error">{saveError}</Notice>}

          {DAYS.map((dayName, day) => {
            const entry = days[day];
            if (!entry) return null;

            return (
              <div
                key={day}
                className={`rounded-xl border p-4 transition-colors duration-300 ${
                  entry.isActive ? 'border-line bg-porcelain' : 'border-line-soft bg-chalk/50'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={entry.isActive}
                      onChange={(event) => updateDay(day, { isActive: event.target.checked })}
                      className="switch-input sr-only"
                    />
                    <span className="switch-track" aria-hidden="true" />
                    <span
                      className={`text-sm font-semibold ${entry.isActive ? 'text-ink' : 'text-ash'}`}
                    >
                      {dayName}
                    </span>
                  </label>
                  {!entry.isActive && <span className="type-tag text-ash">Fechado</span>}
                </div>

                {entry.isActive && (
                  <div className="anim-rise-sm mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="label">Expediente</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          required
                          value={entry.start_time}
                          onChange={(event) => updateDay(day, { start_time: event.target.value })}
                          className="input type-num"
                          aria-label={`Início do expediente — ${dayName}`}
                        />
                        <span className="text-sm text-ash">até</span>
                        <input
                          type="time"
                          required
                          value={entry.end_time}
                          onChange={(event) => updateDay(day, { end_time: event.target.value })}
                          className="input type-num"
                          aria-label={`Fim do expediente — ${dayName}`}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="label">Almoço (opcional)</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={entry.lunch_start}
                          onChange={(event) => updateDay(day, { lunch_start: event.target.value })}
                          className="input type-num"
                          aria-label={`Início do almoço — ${dayName}`}
                        />
                        <span className="text-sm text-ash">até</span>
                        <input
                          type="time"
                          value={entry.lunch_end}
                          onChange={(event) => updateDay(day, { lunch_end: event.target.value })}
                          className="input type-num"
                          aria-label={`Fim do almoço — ${dayName}`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </form>
      </Drawer>
    </div>
  );
};
