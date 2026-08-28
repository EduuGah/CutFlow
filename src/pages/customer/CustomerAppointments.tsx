import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, Clock, Scissors, Star, UserRound } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { AppointmentCardsSkeleton } from '../../components/ui/Skeleton';
import { StatusPill } from '../../components/ui/StatusPill';
import { useToast } from '../../components/ui/Toast';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
}

interface AppointmentData {
  id: string;
  start_datetime: string;
  end_datetime: string;
  status: AppointmentStatus;
  barber_id: string;
  barber: { full_name: string };
  service: { name: string; price: number; duration_minutes: number };
  review?: Review[] | Review | null;
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const firstReview = (value: AppointmentData['review']): Review | null => {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
};

export const CustomerAppointments = () => {
  const { profile } = useAuth();
  const toast = useToast();

  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const [reviewing, setReviewing] = useState<AppointmentData | null>(null);
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAppointments = async () => {
    if (!profile) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from('appointments')
      .select(
        `id, start_datetime, end_datetime, status, barber_id,
         barber:users!barber_id(full_name),
         service:services!service_id(name, price, duration_minutes),
         review:reviews(id, rating, comment)`
      )
      .eq('customer_id', profile.id)
      .order('start_datetime', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('Não deu para carregar seus horários. Recarregue a página.');
    } else if (data) {
      setAppointments(data as unknown as AppointmentData[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    return {
      upcoming: appointments.filter(
        (item) => new Date(item.start_datetime) >= now && item.status !== 'CANCELLED'
      ),
      past: appointments.filter(
        (item) => new Date(item.start_datetime) < now || item.status === 'CANCELLED'
      ),
    };
  }, [appointments]);

  const openReview = (appointment: AppointmentData) => {
    setReviewing(appointment);
    setRating(5);
    setHoveredStar(0);
    setComment('');
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile || !reviewing) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('reviews').insert([
      {
        appointment_id: reviewing.id,
        customer_id: profile.id,
        barber_id: reviewing.barber_id,
        rating,
        comment: comment || null,
      },
    ]);
    setIsSubmitting(false);

    if (error) {
      console.error(error);
      toast.error(`A avaliação não foi enviada: ${error.message}`);
      return;
    }

    setReviewing(null);
    toast.success('Avaliação enviada.');
    fetchAppointments();
  };

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Meus horários"
        title="Seus agendamentos"
        description="O que está por vir e tudo o que já passou pela cadeira."
        actions={
          <Link to="/customer" className="btn btn-primary">
            <CalendarPlus className="h-4 w-4" />
            Marcar horário
          </Link>
        }
      />

      {isLoading ? (
        <AppointmentCardsSkeleton />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="Nenhum horário ainda"
          description="Escolha um dia, um profissional e um serviço para marcar o primeiro corte."
          action={
            <Link to="/customer" className="btn btn-primary">
              Marcar meu primeiro horário
            </Link>
          }
        />
      ) : (
        <>
          <div
            className="inline-flex gap-1 rounded-xl border border-line bg-porcelain p-1"
            role="tablist"
            aria-label="Filtrar agendamentos"
          >
            {(
              [
                ['upcoming', 'Próximos', upcoming.length],
                ['past', 'Histórico', past.length],
              ] as const
            ).map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  tab === value
                    ? 'bg-pine text-white shadow-card'
                    : 'text-smoke hover:bg-chalk hover:text-ink'
                }`}
              >
                {label}
                <span className="type-num ml-2 text-xs opacity-60">{count}</span>
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <EmptyState
              icon={CalendarPlus}
              title={tab === 'upcoming' ? 'Nada marcado por enquanto' : 'Histórico vazio'}
              description={
                tab === 'upcoming'
                  ? 'Quando você marcar um horário, ele aparece aqui com todos os detalhes.'
                  : 'Os atendimentos concluídos e cancelados ficam guardados nesta aba.'
              }
              action={
                tab === 'upcoming' ? (
                  <Link to="/customer" className="btn btn-primary">
                    Marcar horário
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div key={tab} className="grid gap-4 lg:grid-cols-2">
              {list.map((appointment, index) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  index={index}
                  muted={tab === 'past'}
                  onReview={openReview}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Avaliação */}
      <Modal
        open={Boolean(reviewing)}
        onClose={() => setReviewing(null)}
        title="Avaliar atendimento"
        description={reviewing ? `Corte com ${reviewing.barber?.full_name}` : undefined}
      >
        <form onSubmit={submitReview} className="space-y-6 p-6">
          <div className="flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoveredStar || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onFocus={() => setHoveredStar(star)}
                  onBlur={() => setHoveredStar(0)}
                  className="rounded-lg p-1 transition-transform duration-200 hover:scale-115 focus-visible:scale-115"
                  aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                  aria-pressed={rating === star}
                >
                  <Star
                    className={`h-9 w-9 transition-colors duration-200 ${
                      active ? 'fill-brass text-brass' : 'fill-chalk-deep text-chalk-deep'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div>
            <label htmlFor="review-comment" className="label">
              Comentário (opcional)
            </label>
            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="O que funcionou bem? O que poderia melhorar?"
              className="input resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" block onClick={() => setReviewing(null)}>
              Cancelar
            </Button>
            <Button type="submit" block loading={isSubmitting} loadingLabel="Enviando">
              Enviar avaliação
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

/* ------------------------------------------------------------------- Cartão */

const AppointmentCard = ({
  appointment,
  index,
  muted,
  onReview,
}: {
  appointment: AppointmentData;
  index: number;
  muted: boolean;
  onReview: (appointment: AppointmentData) => void;
}) => {
  const date = new Date(appointment.start_datetime);
  const review = firstReview(appointment.review);

  return (
    <article
      className={`card card-interactive anim-rise-sm flex flex-col p-5 ${
        muted ? 'bg-porcelain/70' : ''
      }`}
      style={{ ['--d' as string]: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-13 w-13 flex-none flex-col items-center justify-center rounded-xl px-3 py-2 ${
              muted ? 'bg-chalk text-smoke' : 'bg-pine text-white'
            }`}
          >
            <span className="type-display text-xl leading-none">{date.getDate()}</span>
            <span className="type-tag mt-1 opacity-70">{MONTHS[date.getMonth()]}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink capitalize">
              {date.toLocaleDateString('pt-BR', { weekday: 'long' })}
            </p>
            <p className="type-num mt-1 flex items-center gap-1.5 text-sm text-smoke">
              <Clock className="h-3.5 w-3.5" />
              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <StatusPill status={appointment.status} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-line-soft pt-5 sm:grid-cols-2">
        <div className="flex items-start gap-2.5">
          <UserRound className="mt-0.5 h-4 w-4 flex-none text-ash" />
          <div className="min-w-0">
            <p className="type-tag text-ash">Profissional</p>
            <p className="mt-1 truncate text-sm font-medium text-ink">
              {appointment.barber?.full_name}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Scissors className="mt-0.5 h-4 w-4 flex-none text-ash" />
          <div className="min-w-0">
            <p className="type-tag text-ash">Serviço</p>
            <p className="mt-1 truncate text-sm font-medium text-ink">
              {appointment.service?.name}
            </p>
            <p className="type-num mt-0.5 text-xs text-smoke">
              {appointment.service?.duration_minutes} min
            </p>
          </div>
        </div>
      </div>

      {appointment.status === 'COMPLETED' && (
        <div className="mt-5 border-t border-line-soft pt-5">
          {review ? (
            <div className="rounded-xl bg-chalk px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <p className="type-tag text-ash">Sua nota</p>
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
                <p className="mt-2 text-sm leading-relaxed text-graphite">“{review.comment}”</p>
              )}
            </div>
          ) : (
            <Button variant="outline" size="sm" block onClick={() => onReview(appointment)}>
              <Star className="h-4 w-4" />
              Avaliar atendimento
            </Button>
          )}
        </div>
      )}
    </article>
  );
};
