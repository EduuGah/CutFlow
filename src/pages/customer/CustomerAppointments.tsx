import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Scissors, User, Loader2, CheckCircle2, Star, X } from 'lucide-react';
import { AppointmentStatus } from '../../types';

interface AppointmentData {
  id: string;
  start_datetime: string;
  end_datetime: string;
  status: AppointmentStatus;
  barber_id: string;
  barber: { full_name: string };
  service: { name: string; price: number; duration_minutes: number };
  review?: { id: string; rating: number; comment: string | null }[] | any;
}

export const CustomerAppointments = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingAppointment, setReviewingAppointment] = useState<AppointmentData | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchAppointments = async () => {
    if (!profile) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_datetime,
        end_datetime,
        status,
        barber_id,
        barber:users!barber_id(full_name),
        service:services!service_id(name, price, duration_minutes),
        review:reviews(id, rating, comment)
      `)
      .eq('customer_id', profile.id)
      .order('start_datetime', { ascending: false });

    if (error) {
      console.error('Error fetching appointments:', error);
    } else if (data) {
      setAppointments(data as unknown as AppointmentData[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [profile]);

  const openReviewModal = (appointment: AppointmentData) => {
    setReviewingAppointment(appointment);
    setRating(5);
    setComment('');
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewingAppointment(null);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !reviewingAppointment) return;

    setIsSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert([
      {
        appointment_id: reviewingAppointment.id,
        customer_id: profile.id,
        barber_id: reviewingAppointment.barber_id,
        rating,
        comment: comment || null,
      }
    ]);

    setIsSubmittingReview(false);

    if (error) {
      console.error('Error submitting review:', error);
      alert('Erro ao enviar avaliação: ' + error.message);
    } else {
      closeReviewModal();
      fetchAppointments();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const upcoming = appointments.filter(a => new Date(a.start_datetime) >= new Date() && a.status !== 'CANCELLED');
  const past = appointments.filter(a => new Date(a.start_datetime) < new Date() || a.status === 'CANCELLED');

  const AppointmentCard = ({ appointment, isPast = false }: { appointment: AppointmentData, isPast?: boolean }) => {
    const date = new Date(appointment.start_datetime);
    
    // Check if appointment is strictly COMPLETED to allow reviews
    const isCompleted = appointment.status === 'COMPLETED';
    
    // Supabase can return an object or array for one-to-one relations depending on the query
    const existingReview = Array.isArray(appointment.review) 
      ? appointment.review[0] 
      : appointment.review && appointment.review.id ? appointment.review : null;

    return (
      <div className={`bg-white border rounded-3xl p-6 flex flex-col justify-between ${isPast ? 'border-zinc-200/60 opacity-80' : 'border-zinc-200 shadow-sm'}`}>
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-zinc-50 text-zinc-400' : 'bg-zinc-900 text-white'}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-semibold capitalize ${isPast ? 'text-zinc-600' : 'text-zinc-900'}`}>
                  {date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </p>
                <p className={`text-sm font-medium flex items-center gap-1.5 mt-0.5 ${isPast ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  <Clock className="w-4 h-4" />
                  {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            {appointment.status === 'CANCELLED' ? (
              <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                Cancelado
              </span>
            ) : appointment.status === 'COMPLETED' ? (
              <span className="px-3 py-1 bg-zinc-100 text-zinc-500 text-xs font-semibold rounded-full uppercase tracking-wider">
                Concluído
              </span>
            ) : isPast ? (
              <span className="px-3 py-1 bg-zinc-100 text-zinc-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                Passado
              </span>
            ) : (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirmado
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-100">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Profissional</p>
                <p className="text-sm font-medium text-zinc-900">{appointment.barber?.full_name}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Scissors className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Serviço</p>
                <p className="text-sm font-medium text-zinc-900">{appointment.service?.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{appointment.service?.duration_minutes} min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Section (only for completed appointments) */}
        {isCompleted && (
          <div className="mt-6 pt-6 border-t border-zinc-100">
            {existingReview ? (
              <div className="flex items-start justify-between bg-zinc-50 p-4 rounded-2xl">
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Sua Avaliação</p>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= existingReview.rating ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'}`} />
                    ))}
                  </div>
                  {existingReview.comment && (
                    <p className="text-sm text-zinc-700 mt-2 italic">"{existingReview.comment}"</p>
                  )}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => openReviewModal(appointment)}
                className="w-full py-2.5 flex items-center justify-center gap-2 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium rounded-xl transition-colors text-sm"
              >
                <Star className="w-4 h-4" />
                Avaliar Atendimento
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Meus Agendamentos</h1>
        <p className="text-zinc-500 mt-1">Acompanhe seus horários marcados e histórico.</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white border border-zinc-200 rounded-3xl">
          <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-600 font-medium">Você ainda não tem nenhum agendamento.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Próximos Horários</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcoming.map(app => (
                  <AppointmentCard key={app.id} appointment={app} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Histórico</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {past.map(app => (
                  <AppointmentCard key={app.id} appointment={app} isPast={true} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && reviewingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={closeReviewModal} />
          
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h3 className="text-lg font-bold text-zinc-900">Avaliar Atendimento</h3>
              <button onClick={closeReviewModal} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitReview} className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-zinc-500">Como foi seu corte com</p>
                <p className="text-xl font-bold text-zinc-900">{reviewingAppointment.barber?.full_name}?</p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none hover:scale-110 transition-transform"
                  >
                    <Star className={`w-10 h-10 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-zinc-100 text-zinc-200 hover:text-zinc-300'}`} />
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label htmlFor="comment" className="block text-sm font-medium text-zinc-700">
                  Comentário (opcional)
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte um pouco sobre sua experiência..."
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="flex-1 px-4 py-3 bg-white border border-zinc-200 text-zinc-700 font-medium rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 px-4 py-3 bg-zinc-900 text-white font-medium rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Avaliação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
