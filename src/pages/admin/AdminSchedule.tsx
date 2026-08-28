import { useEffect, useMemo, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Phone, Scissors, Star, UserRound } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { AppointmentStatus } from '../../types';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { AgendaSkeleton } from '../../components/ui/Skeleton';
import { StatusPill } from '../../components/ui/StatusPill';
import { useToast } from '../../components/ui/Toast';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
}

interface AdminAppointment {
  id: string;
  start_datetime: string;
  end_datetime: string;
  status: AppointmentStatus;
  customer: { full_name: string; phone: string | null };
  barber: { full_name: string };
  service: { name: string; price: number; duration_minutes: number };
  review?: Review[] | Review | null;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const brl = (value: number) =>
  Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const unwrap = <T,>(value: T | T[] | null | undefined): T | null => {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
};

export const AdminSchedule = () => {
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [monthDirection, setMonthDirection] = useState<1 | -1>(1);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAgenda = async () => {
      setIsLoading(true);

      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select(
          `id, start_datetime, end_datetime, status,
           customer:users!customer_id(full_name, phone),
           barber:users!barber_id(full_name),
           service:services!service_id(name, price, duration_minutes),
           review:reviews(id, rating, comment)`
        )
        .gte('start_datetime', dayStart.toISOString())
        .lte('start_datetime', dayEnd.toISOString())
        .order('start_datetime', { ascending: true });

      if (cancelled) return;
      if (error) {
        console.error(error);
        toast.error('Não deu para carregar a agenda desta data.');
      } else {
        setAppointments((data as unknown as AdminAppointment[]) ?? []);
      }
      setIsLoading(false);
    };

    fetchAgenda();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leading = new Date(year, month, 1).getDay();

    return [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];
  }, [currentMonth]);

  const byBarber = useMemo(() => {
    const groups = new Map<string, AdminAppointment[]>();
    appointments.forEach((appointment) => {
      const name = unwrap(appointment.barber)?.full_name ?? 'Sem profissional';
      groups.set(name, [...(groups.get(name) ?? []), appointment]);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, 'pt-BR'));
  }, [appointments]);

  const shiftMonth = (delta: 1 | -1) => {
    setMonthDirection(delta);
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  const goToday = () => {
    const today = new Date();
    setMonthDirection(1);
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow="Agenda da casa"
        title="O dia de toda a equipe"
        description="Escolha uma data no calendário para ver quem atende quem."
      />

      <div className="card p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="type-sign text-base text-ink sm:text-lg">
            {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR }).replace(/^./, (c) =>
              c.toUpperCase()
            )}
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="icon-btn border border-line"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={goToday} className="btn btn-outline btn-sm">
              Hoje
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="icon-btn border border-line"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center sm:gap-1.5">
          {WEEKDAYS.map((day) => (
            <span key={day} className="type-tag py-1 text-ash">
              {day}
            </span>
          ))}
        </div>

        <div
          key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
          className={`grid grid-cols-7 gap-1 sm:gap-1.5 ${
            monthDirection === 1 ? 'anim-slide-left' : 'anim-slide-right'
          }`}
        >
          {calendarDays.map((date, index) => {
            if (!date) return <span key={`gap-${index}`} className="h-11" />;

            const isSelected = isSameDay(selectedDate, date);
            const isToday = isSameDay(new Date(), date);

            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`type-num flex h-11 items-center justify-center rounded-lg text-sm transition-all duration-200 ${
                  isSelected
                    ? 'bg-pine text-white shadow-lift'
                    : 'text-graphite hover:bg-pine-wash hover:text-pine'
                } ${isToday && !isSelected ? 'ring-1 ring-brass/60 ring-inset' : ''}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <section>
        <h2 className="type-sign mb-4 text-lg text-ink capitalize">
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </h2>

        {isLoading ? (
          <AgendaSkeleton count={2} />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nada marcado nesta data"
            description="Escolha outro dia no calendário acima para ver os atendimentos da equipe."
          />
        ) : (
          <div className="space-y-8">
            {byBarber.map(([barberName, items], groupIndex) => (
              <div key={barberName}>
                <div className="mb-3 flex items-center gap-3 border-b border-line pb-2.5">
                  <UserRound className="h-4 w-4 text-ash" />
                  <h3 className="text-[0.9375rem] font-semibold text-ink">{barberName}</h3>
                  <span className="pill pill-neutral">
                    {items.length} {items.length === 1 ? 'horário' : 'horários'}
                  </span>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {items.map((appointment, index) => {
                    const start = new Date(appointment.start_datetime);
                    const service = unwrap(appointment.service);
                    const customer = unwrap(appointment.customer);
                    const review = unwrap(appointment.review);

                    return (
                      <article
                        key={appointment.id}
                        className={`card anim-rise-sm p-4 ${
                          appointment.status === 'CANCELLED'
                            ? 'opacity-65'
                            : appointment.status === 'IN_PROGRESS'
                              ? 'border-cobalt/40 shadow-lift'
                              : ''
                        }`}
                        style={{ ['--d' as string]: `${(groupIndex * 3 + index) * 55}ms` }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={`type-num rounded-lg px-2.5 py-1.5 text-sm font-medium ${
                              appointment.status === 'CANCELLED'
                                ? 'bg-chalk text-ash'
                                : appointment.status === 'IN_PROGRESS'
                                  ? 'bg-cobalt text-white'
                                  : 'bg-pine text-white'
                            }`}
                          >
                            {format(start, 'HH:mm')}
                          </span>
                          <StatusPill status={appointment.status} />
                        </div>

                        <div className="mt-4 grid gap-4 border-t border-line-soft pt-4 sm:grid-cols-2">
                          <div className="min-w-0">
                            <p className="type-tag text-ash">Cliente</p>
                            <p className="mt-1 truncate text-sm font-medium text-ink">
                              {customer?.full_name}
                            </p>
                            {customer?.phone && (
                              <p className="type-num mt-0.5 flex items-center gap-1.5 text-xs text-smoke">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </p>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="type-tag text-ash">Serviço</p>
                            <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-medium text-ink">
                              <Scissors className="h-3.5 w-3.5 flex-none text-ash" />
                              {service?.name}
                            </p>
                            <p className="type-num mt-0.5 flex items-center gap-2 text-xs text-smoke">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service?.duration_minutes} min
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>R$ {brl(service?.price ?? 0)}</span>
                            </p>
                          </div>
                        </div>

                        {appointment.status === 'COMPLETED' && review && (
                          <div className="mt-4 rounded-lg bg-chalk px-3.5 py-3">
                            <div className="flex items-center gap-2.5">
                              <p className="type-tag text-ash">Nota</p>
                              <span className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= review.rating
                                        ? 'fill-brass text-brass'
                                        : 'fill-line text-line'
                                    }`}
                                  />
                                ))}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="mt-1.5 text-sm leading-relaxed text-graphite">
                                “{review.comment}”
                              </p>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
