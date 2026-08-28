import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, format, isSameDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Phone,
  Play,
  Scissors,
  Star,
  Undo2,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { AppointmentStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { AgendaSkeleton, StatGridSkeleton } from '../../components/ui/Skeleton';
import { StatusPill } from '../../components/ui/StatusPill';
import { useToast } from '../../components/ui/Toast';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
}

interface DailyAppointment {
  id: string;
  start_datetime: string;
  end_datetime: string;
  status: AppointmentStatus;
  customer: { full_name: string; phone: string | null };
  service: { name: string; price: number; duration_minutes: number };
  review?: Review[] | Review | null;
}

const brl = (value: number) =>
  Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const firstReview = (value: DailyAppointment['review']): Review | null => {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
};

export const BarberDashboard = () => {
  const { profile } = useAuth();
  const toast = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<DailyAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;

    let cancelled = false;
    const fetchAgenda = async () => {
      setIsLoading(true);

      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select(
          `id, start_datetime, end_datetime, status,
           customer:users!customer_id(full_name, phone),
           service:services!service_id(name, price, duration_minutes),
           review:reviews(id, rating, comment)`
        )
        .eq('barber_id', profile.id)
        .gte('start_datetime', dayStart.toISOString())
        .lte('start_datetime', dayEnd.toISOString())
        .order('start_datetime', { ascending: true });

      if (cancelled) return;
      if (error) {
        console.error(error);
        toast.error('Não deu para carregar a agenda deste dia.');
      } else {
        setAppointments((data as unknown as DailyAppointment[]) ?? []);
      }
      setIsLoading(false);
    };

    fetchAgenda();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, profile]);

  const updateStatus = useCallback(
    async (id: string, status: AppointmentStatus, message: string) => {
      setUpdatingId(id);
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      setUpdatingId(null);

      if (error) {
        console.error(error);
        toast.error('O status não foi alterado. Tente de novo.');
        return;
      }

      setAppointments((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item))
      );
      toast.success(message);
    },
    [toast]
  );

  const summary = useMemo(() => {
    const active = appointments.filter((item) => item.status !== 'CANCELLED');
    return {
      total: appointments.length,
      done: appointments.filter((item) => item.status === 'COMPLETED').length,
      revenue: active.reduce((sum, item) => sum + Number(item.service?.price ?? 0), 0),
      next: active.find(
        (item) => item.status !== 'COMPLETED' && new Date(item.end_datetime) >= new Date()
      ),
    };
  }, [appointments]);

  const isToday = isSameDay(currentDate, new Date());

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Minha agenda"
        title="Meu dia"
        description={`Olá, ${profile?.full_name?.split(' ')[0] ?? ''}. Estes são os compromissos da data escolhida.`}
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-line bg-porcelain p-1">
            <button
              type="button"
              onClick={() => setCurrentDate((prev) => subDays(prev, 1))}
              className="icon-btn"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date())}
              className="min-w-32 rounded-lg px-3 py-1.5 text-center transition-colors hover:bg-chalk"
            >
              <span className="block text-sm font-semibold text-ink capitalize">
                {isToday ? 'Hoje' : format(currentDate, 'EEEE', { locale: ptBR })}
              </span>
              <span className="type-num block text-xs text-smoke">
                {format(currentDate, "d 'de' MMM", { locale: ptBR })}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentDate((prev) => addDays(prev, 1))}
              className="icon-btn"
              aria-label="Próximo dia"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {isLoading ? (
        <>
          <StatGridSkeleton count={3} />
          <AgendaSkeleton />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Stat label="Atendimentos" value={String(summary.total)} />
            <Stat label="Concluídos" value={String(summary.done)} />
            <Stat label="Previsão do dia" value={`R$ ${brl(summary.revenue)}`} wide />
            <Stat
              label="Próximo"
              value={
                summary.next ? format(new Date(summary.next.start_datetime), 'HH:mm') : '—'
              }
              hint={summary.next?.customer?.full_name.split(' ')[0]}
            />
          </div>

          {appointments.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Agenda livre"
              description="Nenhum cliente marcado para este dia. Use as setas acima para conferir outra data."
            />
          ) : (
            <ol className="space-y-3">
              {appointments.map((appointment, index) => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  index={index}
                  isNext={summary.next?.id === appointment.id && isToday}
                  isUpdating={updatingId === appointment.id}
                  confirmingCancel={confirmCancelId === appointment.id}
                  onAskCancel={() => setConfirmCancelId(appointment.id)}
                  onDismissCancel={() => setConfirmCancelId(null)}
                  onUpdate={updateStatus}
                />
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------- Stat */

const Stat = ({
  label,
  value,
  hint,
  wide,
}: {
  label: string;
  value: string;
  hint?: string;
  wide?: boolean;
}) => (
  <div className={`card anim-rise-sm p-4 sm:p-5 ${wide ? 'col-span-2 lg:col-span-1' : ''}`}>
    <p className="type-tag text-ash">{label}</p>
    <p className="type-display mt-3 text-3xl text-ink">{value}</p>
    {hint && <p className="mt-1 truncate text-xs text-smoke">{hint}</p>}
  </div>
);

/* ------------------------------------------------------------------- Linha */

interface RowProps {
  appointment: DailyAppointment;
  index: number;
  isNext: boolean;
  isUpdating: boolean;
  confirmingCancel: boolean;
  onAskCancel: () => void;
  onDismissCancel: () => void;
  onUpdate: (id: string, status: AppointmentStatus, message: string) => void;
}

const AppointmentRow = ({
  appointment,
  index,
  isNext,
  isUpdating,
  confirmingCancel,
  onAskCancel,
  onDismissCancel,
  onUpdate,
}: RowProps) => {
  const start = new Date(appointment.start_datetime);
  const end = new Date(appointment.end_datetime);
  const review = firstReview(appointment.review);
  const { status } = appointment;

  const tone =
    status === 'CANCELLED'
      ? 'border-line-soft bg-porcelain/60 opacity-70'
      : status === 'COMPLETED'
        ? 'border-line-soft bg-chalk/40'
        : status === 'IN_PROGRESS'
          ? 'border-cobalt/40 shadow-lift'
          : 'border-line';

  return (
    <li
      className={`card anim-rise-sm flex flex-col gap-5 border p-5 md:flex-row md:items-center ${tone}`}
      style={{ ['--d' as string]: `${index * 60}ms` }}
    >
      {/* Horário */}
      <div className="flex items-center gap-4 md:w-44">
        <div
          className={`flex flex-none flex-col items-center rounded-xl px-3 py-2 ${
            status === 'CANCELLED'
              ? 'bg-chalk text-ash'
              : status === 'IN_PROGRESS'
                ? 'bg-cobalt text-white'
                : 'bg-pine text-white'
          } ${isNext && status === 'CONFIRMED' ? 'anim-ring' : ''}`}
        >
          <span className="type-num text-lg leading-none font-medium">{format(start, 'HH:mm')}</span>
        </div>
        <div className="min-w-0">
          <p className="type-num text-sm text-graphite">até {format(end, 'HH:mm')}</p>
          <p className="mt-0.5 text-xs text-ash">{appointment.service?.duration_minutes} min</p>
        </div>
      </div>

      {/* Cliente e serviço */}
      <div className="min-w-0 flex-1 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="type-tag flex items-center gap-1.5 text-ash">
              <UserRound className="h-3.5 w-3.5" />
              Cliente
            </p>
            <p className="mt-1.5 truncate text-[0.9375rem] font-semibold text-ink">
              {appointment.customer?.full_name}
            </p>
            {appointment.customer?.phone && (
              <a
                href={`tel:${appointment.customer.phone.replace(/\D/g, '')}`}
                className="type-num link-underline mt-0.5 inline-flex items-center gap-1.5 text-sm text-smoke hover:text-pine"
              >
                <Phone className="h-3 w-3" />
                {appointment.customer.phone}
              </a>
            )}
          </div>
          <div className="min-w-0">
            <p className="type-tag flex items-center gap-1.5 text-ash">
              <Scissors className="h-3.5 w-3.5" />
              Serviço
            </p>
            <p className="mt-1.5 truncate text-[0.9375rem] font-semibold text-ink">
              {appointment.service?.name}
            </p>
            <p className="type-num mt-0.5 text-sm text-smoke">
              R$ {brl(appointment.service?.price ?? 0)}
            </p>
          </div>
        </div>

        {status === 'COMPLETED' && review && (
          <div className="rounded-xl bg-chalk px-4 py-3">
            <div className="flex items-center gap-2.5">
              <p className="type-tag text-ash">Nota do cliente</p>
              <span className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= review.rating ? 'fill-brass text-brass' : 'fill-line text-line'
                    }`}
                  />
                ))}
              </span>
            </div>
            {review.comment && (
              <p className="mt-1.5 text-sm leading-relaxed text-graphite">“{review.comment}”</p>
            )}
          </div>
        )}
      </div>

      {/* Estado e ações */}
      <div className="flex flex-col items-start gap-3 border-t border-line-soft pt-4 md:w-52 md:items-end md:border-t-0 md:border-l md:pt-0 md:pl-5">
        <StatusPill status={status} />

        {confirmingCancel ? (
          <div className="anim-pop flex w-full items-center justify-between gap-2 rounded-lg border border-oxblood/25 bg-oxblood-wash px-2.5 py-2 md:w-auto">
            <span className="text-xs font-semibold text-oxblood">Cancelar mesmo?</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={onDismissCancel}
                className="rounded-md border border-oxblood/20 bg-porcelain px-2.5 py-1 text-xs font-semibold text-graphite transition-colors hover:bg-chalk"
              >
                Não
              </button>
              <Button
                size="sm"
                variant="danger"
                loading={isUpdating}
                onClick={() => {
                  onUpdate(appointment.id, 'CANCELLED', 'Atendimento cancelado.');
                  onDismissCancel();
                }}
                className="px-2.5 py-1 text-xs"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
            {status === 'CONFIRMED' && (
              <>
                <button
                  type="button"
                  onClick={onAskCancel}
                  disabled={isUpdating}
                  className="icon-btn icon-btn-danger"
                  aria-label="Cancelar atendimento"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(appointment.id, 'IN_PROGRESS', 'Atendimento iniciado.')}
                  disabled={isUpdating}
                  className="icon-btn hover:bg-cobalt-wash hover:text-cobalt"
                  aria-label="Iniciar atendimento"
                >
                  <Play className="h-4 w-4" />
                </button>
                <Button
                  size="sm"
                  loading={isUpdating}
                  onClick={() => onUpdate(appointment.id, 'COMPLETED', 'Atendimento concluído.')}
                >
                  <Check className="h-4 w-4" />
                  Concluir
                </Button>
              </>
            )}

            {status === 'IN_PROGRESS' && (
              <>
                <button
                  type="button"
                  onClick={() => onUpdate(appointment.id, 'CONFIRMED', 'Voltou para a fila.')}
                  disabled={isUpdating}
                  className="icon-btn"
                  aria-label="Voltar para aguardando"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
                <Button
                  size="sm"
                  loading={isUpdating}
                  onClick={() => onUpdate(appointment.id, 'COMPLETED', 'Atendimento concluído.')}
                >
                  <Check className="h-4 w-4" />
                  Concluir
                </Button>
              </>
            )}

            {(status === 'COMPLETED' || status === 'CANCELLED') && (
              <Button
                size="sm"
                variant="outline"
                loading={isUpdating}
                onClick={() => onUpdate(appointment.id, 'CONFIRMED', 'Atendimento reaberto.')}
              >
                <Undo2 className="h-4 w-4" />
                Reabrir
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  );
};
