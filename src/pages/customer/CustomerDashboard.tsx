import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Scissors,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { Appointment, BarberSchedule, Service, UserProfile } from '../../types';
import { getAvailableTimeSlots } from '../../utils/scheduling';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { PoleRail } from '../../components/ui/Pole';
import { BookingSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const brl = (value: number) =>
  Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

const sameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

/* ------------------------------------------------------------------ Etapa */

interface StepProps {
  number: number;
  title: string;
  ready: boolean;
  done: boolean;
  children: React.ReactNode;
}

const Step = ({ number, title, ready, done, children }: StepProps) => (
  <section className="transition-opacity duration-500" style={{ opacity: ready ? 1 : 0.4 }}>
    <div className="mb-4 flex items-center gap-3">
      <span className="type-num text-sm text-ash">{String(number).padStart(2, '0')}</span>
      <h2 className="type-sign text-lg text-ink">{title}</h2>
      {done && (
        <CheckCircle2 className="anim-pop h-4 w-4 text-verdigris" strokeWidth={2.5} aria-label="etapa concluída" />
      )}
    </div>
    <fieldset disabled={!ready} className="min-w-0 border-0 p-0">
      {children}
    </fieldset>
  </section>
);

/* ------------------------------------------------------------------ Página */

interface Confirmation {
  date: Date;
  time: string;
  barber: string;
  service: string;
  price: number;
}

export const CustomerDashboard = () => {
  const { profile } = useAuth();
  const toast = useToast();

  const [barbers, setBarbers] = useState<UserProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [schedules, setSchedules] = useState<BarberSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<UserProfile | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<{ start: Date; end: Date }[]>([]);
  const [isCheckingSlots, setIsCheckingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [monthDirection, setMonthDirection] = useState<1 | -1>(1);

  /* --- Carga inicial ---------------------------------------------------- */

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [barbersRes, servicesRes, schedulesRes] = await Promise.all([
        supabase.from('users').select('*').eq('role', 'BARBER').order('full_name'),
        supabase.from('services').select('*').eq('is_active', true).order('name'),
        supabase.from('barber_schedules').select('*'),
      ]);

      if (barbersRes.data) setBarbers(barbersRes.data as UserProfile[]);
      if (servicesRes.data) setServices(servicesRes.data as Service[]);
      if (schedulesRes.data) setSchedules(schedulesRes.data as BarberSchedule[]);
      setIsLoading(false);
    };

    load();
  }, []);

  /* --- Dias em que a casa abre ------------------------------------------ */

  const openWeekdays = useMemo(
    () => new Set(schedules.map((schedule) => schedule.day_of_week)),
    [schedules]
  );

  const availableBarbers = useMemo(() => {
    if (!selectedDate) return barbers;
    const weekday = selectedDate.getDay();
    return barbers.filter((barber) =>
      schedules.some((s) => s.barber_id === barber.id && s.day_of_week === weekday)
    );
  }, [barbers, schedules, selectedDate]);

  // Trocar a data pode tirar o profissional escolhido do expediente.
  useEffect(() => {
    if (selectedBarber && !availableBarbers.some((barber) => barber.id === selectedBarber.id)) {
      setSelectedBarber(null);
    }
  }, [availableBarbers, selectedBarber]);

  /* --- Horários livres --------------------------------------------------- */

  useEffect(() => {
    setSelectedTime(null);

    if (!selectedDate || !selectedBarber || !selectedService) {
      setBookedAppointments([]);
      setBlockedTimes([]);
      return;
    }

    let cancelled = false;
    const fetchSlots = async () => {
      setIsCheckingSlots(true);

      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(23, 59, 59, 999);

      const [appointmentsRes, timeOffsRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('*')
          .eq('barber_id', selectedBarber.id)
          .gte('start_datetime', dayStart.toISOString())
          .lte('start_datetime', dayEnd.toISOString())
          .neq('status', 'CANCELLED'),
        supabase
          .from('time_offs')
          .select('*')
          .eq('barber_id', selectedBarber.id)
          .gte('start_datetime', dayStart.toISOString())
          .lte('start_datetime', dayEnd.toISOString()),
      ]);

      if (cancelled) return;

      setBookedAppointments((appointmentsRes.data as Appointment[]) ?? []);
      setBlockedTimes(
        (timeOffsRes.data ?? []).map((timeOff) => ({
          start: new Date(timeOff.start_datetime),
          end: new Date(timeOff.end_datetime),
        }))
      );
      setIsCheckingSlots(false);
    };

    fetchSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, selectedBarber, selectedService]);

  const slots = useMemo(() => {
    if (!selectedDate || !selectedBarber || !selectedService) return [];

    const schedule = schedules.find(
      (s) => s.barber_id === selectedBarber.id && s.day_of_week === selectedDate.getDay()
    );
    if (!schedule) return [];

    return getAvailableTimeSlots(
      selectedDate,
      {
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        lunch_start: schedule.lunch_start,
        lunch_end: schedule.lunch_end,
      },
      selectedService.duration_minutes,
      bookedAppointments.map((appointment) => ({
        start: new Date(appointment.start_datetime),
        end: new Date(appointment.end_datetime),
      })),
      blockedTimes
    );
  }, [selectedDate, selectedBarber, selectedService, schedules, bookedAppointments, blockedTimes]);

  /* --- Calendário -------------------------------------------------------- */

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

  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const isCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();

  const shiftMonth = (delta: 1 | -1) => {
    if (delta === -1 && isCurrentMonth) return;
    setMonthDirection(delta);
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  /* --- Confirmação ------------------------------------------------------- */

  const handleBook = useCallback(async () => {
    if (!profile || !selectedDate || !selectedBarber || !selectedService || !selectedTime) return;

    setIsBooking(true);

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const start = new Date(selectedDate);
    start.setHours(hours, minutes, 0, 0);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + selectedService.duration_minutes);

    const { error } = await supabase.from('appointments').insert({
      customer_id: profile.id,
      barber_id: selectedBarber.id,
      service_id: selectedService.id,
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString(),
      status: 'CONFIRMED',
    });

    setIsBooking(false);

    if (error) {
      console.error(error);
      toast.error('Não deu para marcar esse horário. Escolha outro e tente de novo.');
      return;
    }

    setConfirmation({
      date: start,
      time: selectedTime,
      barber: selectedBarber.full_name,
      service: selectedService.name,
      price: Number(selectedService.price),
    });
    toast.success('Horário marcado.');

    setSelectedTime(null);
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedDate(null);
  }, [profile, selectedDate, selectedBarber, selectedService, selectedTime, toast]);

  const stepsDone = [selectedDate, selectedBarber, selectedService, selectedTime].filter(Boolean).length;

  /* --- Render ------------------------------------------------------------ */

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Agendar"
        title="Marque seu horário"
        description="Escolha o dia, o profissional e o serviço. Os horários livres aparecem em seguida."
      />

      {isLoading ? (
        <BookingSkeleton />
      ) : (
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Etapas */}
          <div className="flex gap-4 sm:gap-5 lg:col-span-7 xl:col-span-8">
            <PoleRail progress={(stepsDone / 4) * 100} />

            <div className="min-w-0 flex-1 space-y-9">
              {/* 1 — Data */}
              <Step number={1} title="Dia do atendimento" ready done={Boolean(selectedDate)}>
                <div className="card p-4 sm:p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="type-sign text-base text-ink">
                      {currentMonth
                        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                        .replace(/^./, (c) => c.toUpperCase())}
                    </h3>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => shiftMonth(-1)}
                        disabled={isCurrentMonth}
                        className="icon-btn border border-line"
                        aria-label="Mês anterior"
                      >
                        <ChevronLeft className="h-4 w-4" />
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

                      const isPast = date.getTime() < today.getTime();
                      const isOpen = openWeekdays.has(date.getDay());
                      const isSelected = selectedDate ? sameDay(selectedDate, date) : false;
                      const isToday = sameDay(today, date);
                      const disabled = isPast || !isOpen;

                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          onClick={() => setSelectedDate(date)}
                          disabled={disabled}
                          aria-current={isToday ? 'date' : undefined}
                          className={`type-num relative flex h-11 items-center justify-center rounded-lg text-sm transition-all duration-200 ${
                            isSelected
                              ? 'bg-pine text-white shadow-lift'
                              : disabled
                                ? 'cursor-not-allowed text-ash'
                                : 'text-graphite hover:bg-pine-wash hover:text-pine'
                          } ${isToday && !isSelected ? 'ring-1 ring-brass/60 ring-inset' : ''}`}
                        >
                          {date.getDate()}
                          {isOpen && !isPast && !isSelected && (
                            <span
                              className="absolute bottom-1.5 h-1 w-1 rounded-full bg-brass"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-4 flex items-center gap-2 border-t border-line-soft pt-4 text-xs text-ash">
                    <span className="h-1.5 w-1.5 rounded-full bg-brass" aria-hidden="true" />
                    Dias com equipe em expediente
                  </p>
                </div>
              </Step>

              {/* 2 — Profissional */}
              <Step
                number={2}
                title="Profissional"
                ready={Boolean(selectedDate)}
                done={Boolean(selectedBarber)}
              >
                {availableBarbers.length === 0 ? (
                  <p className="card-quiet px-5 py-6 text-sm text-smoke">
                    {selectedDate
                      ? 'Ninguém atende nesse dia. Escolha outra data no calendário.'
                      : 'Nenhum profissional cadastrado ainda. Fale com a barbearia.'}
                  </p>
                ) : (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {availableBarbers.map((barber, index) => {
                      const isSelected = selectedBarber?.id === barber.id;
                      return (
                        <button
                          key={barber.id}
                          type="button"
                          onClick={() => setSelectedBarber(barber)}
                          style={{ ['--d' as string]: `${index * 60}ms` }}
                          className={`anim-rise-sm press flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-pine bg-pine-wash shadow-card'
                              : 'border-line bg-porcelain hover:border-ash hover:shadow-card'
                          }`}
                        >
                          <span
                            className={`flex h-11 w-11 flex-none items-center justify-center rounded-full text-sm font-bold transition-colors ${
                              isSelected ? 'bg-pine text-white' : 'bg-chalk text-smoke'
                            }`}
                          >
                            {initials(barber.full_name)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-ink">
                              {barber.full_name}
                            </span>
                            <span className="type-tag mt-1 block text-ash">Barbeiro</span>
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="anim-pop h-5 w-5 flex-none text-pine" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Step>

              {/* 3 — Serviço */}
              <Step
                number={3}
                title="Serviço"
                ready={Boolean(selectedBarber)}
                done={Boolean(selectedService)}
              >
                {services.length === 0 ? (
                  <p className="card-quiet px-5 py-6 text-sm text-smoke">
                    O catálogo ainda está vazio. Fale com a barbearia.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {services.map((service, index) => {
                      const isSelected = selectedService?.id === service.id;
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setSelectedService(service)}
                          style={{ ['--d' as string]: `${index * 60}ms` }}
                          className={`anim-rise-sm press flex w-full items-start justify-between gap-4 rounded-xl border p-4 text-left transition-all duration-200 sm:p-5 ${
                            isSelected
                              ? 'border-pine bg-pine-wash shadow-card'
                              : 'border-line bg-porcelain hover:border-ash hover:shadow-card'
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block text-[0.9375rem] font-semibold text-ink">
                              {service.name}
                            </span>
                            {service.description && (
                              <span className="mt-1 block text-sm leading-relaxed text-smoke">
                                {service.description}
                              </span>
                            )}
                            <span className="type-tag mt-2.5 flex items-center gap-1.5 text-ash">
                              <Clock className="h-3.5 w-3.5" />
                              {service.duration_minutes} min
                            </span>
                          </span>
                          <span className="flex flex-none flex-col items-end gap-2">
                            <span className="type-num text-base font-medium whitespace-nowrap text-ink">
                              R$ {brl(service.price)}
                            </span>
                            {isSelected && <CheckCircle2 className="anim-pop h-5 w-5 text-pine" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Step>

              {/* 4 — Horário */}
              <Step
                number={4}
                title="Horário"
                ready={Boolean(selectedDate && selectedBarber && selectedService)}
                done={Boolean(selectedTime)}
              >
                {isCheckingSlots ? (
                  <div className="card grid grid-cols-3 gap-2 p-4 sm:grid-cols-4 sm:gap-2.5 sm:p-5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-11" rounded="rounded-lg" />
                    ))}
                  </div>
                ) : !selectedDate || !selectedBarber || !selectedService ? (
                  <p className="card-quiet px-5 py-6 text-sm text-smoke">
                    Conclua as etapas acima e os horários livres aparecem aqui.
                  </p>
                ) : slots.length === 0 ? (
                  <p className="card-quiet px-5 py-6 text-sm text-smoke">
                    Esse dia já está cheio para {selectedBarber.full_name.split(' ')[0]}. Tente outra
                    data ou outro profissional.
                  </p>
                ) : (
                  <div className="card grid grid-cols-3 gap-2 p-4 sm:grid-cols-4 sm:gap-2.5 sm:p-5">
                    {slots.map((time, index) => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          style={{ ['--d' as string]: `${index * 35}ms` }}
                          className={`anim-pop type-num press rounded-lg border py-3 text-sm transition-all duration-200 ${
                            isSelected
                              ? 'border-pine bg-pine text-white shadow-lift'
                              : 'border-line bg-porcelain text-graphite hover:border-pine hover:text-pine'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Step>
            </div>
          </div>

          {/* Comanda */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 xl:col-span-4">
            {confirmation ? (
              <div className="comanda anim-pop p-6 pt-8">
                <p className="type-tag text-verdigris">Marcado</p>
                <h2 className="type-display mt-3 text-3xl text-ink">
                  {confirmation.date
                    .toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
                    .replace(/^./, (c) => c.toUpperCase())}
                </h2>
                <p className="type-num mt-1 text-2xl text-pine">às {confirmation.time}</p>

                <hr className="comanda-rule my-6" />

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-smoke">Profissional</dt>
                    <dd className="font-medium text-ink">{confirmation.barber}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-smoke">Serviço</dt>
                    <dd className="font-medium text-ink">{confirmation.service}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-smoke">Valor</dt>
                    <dd className="type-num font-medium text-ink">R$ {brl(confirmation.price)}</dd>
                  </div>
                </dl>

                <hr className="comanda-rule my-6" />

                <div className="flex flex-col gap-2.5">
                  <Link to="/customer/appointments" className="btn btn-primary btn-lg w-full">
                    Ver meus horários
                  </Link>
                  <Button variant="outline" block onClick={() => setConfirmation(null)}>
                    Marcar outro
                  </Button>
                </div>
              </div>
            ) : (
              <div className="comanda p-6 pt-8">
                <p className="type-tag text-brass-deep">Comanda</p>

                <dl className="mt-6 space-y-5">
                  <SummaryRow
                    icon={CalendarDays}
                    label="Data"
                    value={
                      selectedDate
                        ? selectedDate
                            .toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                            })
                            .replace(/^./, (c) => c.toUpperCase())
                        : null
                    }
                    detail={selectedTime ? `às ${selectedTime}` : undefined}
                  />
                  <SummaryRow
                    icon={UserRound}
                    label="Profissional"
                    value={selectedBarber?.full_name ?? null}
                  />
                  <SummaryRow
                    icon={Scissors}
                    label="Serviço"
                    value={selectedService?.name ?? null}
                    detail={
                      selectedService
                        ? `${selectedService.duration_minutes} min · R$ ${brl(selectedService.price)}`
                        : undefined
                    }
                  />
                </dl>

                <hr className="comanda-rule my-6" />

                <Button
                  block
                  size="lg"
                  onClick={handleBook}
                  loading={isBooking}
                  loadingLabel="Confirmando"
                  disabled={!selectedTime}
                >
                  Confirmar agendamento
                </Button>

                <p className="mt-3 text-center text-xs text-ash">
                  {selectedTime
                    ? 'O horário sai da agenda assim que você confirmar.'
                    : `Faltam ${4 - stepsDone} ${4 - stepsDone === 1 ? 'etapa' : 'etapas'} para confirmar.`}
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------ Linha da comanda */

const SummaryRow = ({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string | null;
  detail?: string;
}) => (
  <div className="flex items-start gap-3.5">
    <span
      className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg transition-colors duration-300 ${
        value ? 'bg-pine-wash text-pine' : 'bg-chalk text-ash'
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.9} />
    </span>
    <div className="min-w-0 flex-1">
      <dt className="type-tag text-ash">{label}</dt>
      <dd key={value ?? 'empty'} className={`mt-1.5 ${value ? 'anim-tick' : ''}`}>
        <span className={`block text-sm ${value ? 'font-semibold text-ink' : 'text-ash'}`}>
          {value ?? 'A escolher'}
        </span>
        {detail && <span className="type-num mt-0.5 block text-xs text-smoke">{detail}</span>}
      </dd>
    </div>
  </div>
);
