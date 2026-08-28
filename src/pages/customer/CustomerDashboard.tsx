import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { UserProfile, Service, BarberSchedule, Appointment } from '../../types';
import { Calendar as CalendarIcon, Clock, Scissors, User, ChevronRight, ChevronLeft, Loader2, Info, CheckCircle2 } from 'lucide-react';

export const CustomerDashboard = () => {
  const { profile } = useAuth();
  
  const [barbers, setBarbers] = useState<UserProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [schedules, setSchedules] = useState<BarberSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selections
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<UserProfile | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Time Slots State
  const [isTimeSelectionVisible, setIsTimeSelectionVisible] = useState(false);
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<{start: Date, end: Date}[]>([]);
  const [isCheckingSlots, setIsCheckingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Reset time selection when inputs change
  useEffect(() => {
    setIsTimeSelectionVisible(false);
    setSelectedTime(null);
  }, [selectedDate, selectedBarber, selectedService]);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      setIsLoading(true);
      
      const [barbersRes, servicesRes, schedulesRes] = await Promise.all([
        supabase.from('users').select('*').eq('role', 'BARBER').order('full_name'),
        supabase.from('services').select('*').eq('is_active', true).order('name'),
        supabase.from('barber_schedules').select('*')
      ]);

      if (barbersRes.data) setBarbers(barbersRes.data as UserProfile[]);
      if (servicesRes.data) setServices(servicesRes.data as Service[]);
      if (schedulesRes.data) setSchedules(schedulesRes.data as BarberSchedule[]);
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // When date changes, check if selected barber is still available
  useEffect(() => {
    if (selectedDate && selectedBarber) {
      const dayOfWeek = selectedDate.getDay();
      const hasSchedule = schedules.some(
        s => s.barber_id === selectedBarber.id && s.day_of_week === dayOfWeek
      );
      if (!hasSchedule) {
        setSelectedBarber(null);
      }
    }
  }, [selectedDate, schedules, selectedBarber]);

  // Helpers for date formatting
  const formatMonthYear = (date: Date) => {
    const str = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Filter barbers that work on the selected date
  const availableBarbers = barbers.filter(barber => {
    if (!selectedDate) return true;
    const dayOfWeek = selectedDate.getDay();
    return schedules.some(s => s.barber_id === barber.id && s.day_of_week === dayOfWeek);
  });

  // Calendar Generation
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    
    const days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() < today.getTime();
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const today = new Date();
    const currentMonthTime = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getTime();
    const thisMonthTime = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
    if (currentMonthTime > thisMonthTime) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    }
  };

  const isPrevMonthDisabled = () => {
    const today = new Date();
    return currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();
  };

  const handleContinueToTimes = async () => {
    if (!selectedDate || !selectedBarber || !selectedService) return;
    
    setIsCheckingSlots(true);
    setIsTimeSelectionVisible(true);
    
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const [appointmentsRes, timeOffsRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', selectedBarber.id)
        .gte('start_datetime', startOfDay.toISOString())
        .lte('start_datetime', endOfDay.toISOString())
        .neq('status', 'CANCELLED'),
      supabase
        .from('time_offs')
        .select('*')
        .eq('barber_id', selectedBarber.id)
        .gte('start_datetime', startOfDay.toISOString())
        .lte('start_datetime', endOfDay.toISOString())
    ]);
        
    if (appointmentsRes.data) {
      setBookedAppointments(appointmentsRes.data as Appointment[]);
    }

    if (timeOffsRes.data) {
      setBlockedTimes(timeOffsRes.data.map(t => ({
        start: new Date(t.start_datetime),
        end: new Date(t.end_datetime)
      })));
    } else {
      setBlockedTimes([]);
    }
    
    setIsCheckingSlots(false);
  };

  const generateTimeSlots = () => {
    if (!selectedDate || !selectedBarber || !selectedService) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const schedule = schedules.find(s => s.barber_id === selectedBarber.id && s.day_of_week === dayOfWeek);
    
    if (!schedule) return [];
    
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const formatTime = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
    
    const startMins = parseTime(schedule.start_time);
    const endMins = parseTime(schedule.end_time);
    const lunchStartMins = schedule.lunch_start ? parseTime(schedule.lunch_start) : null;
    const lunchEndMins = schedule.lunch_end ? parseTime(schedule.lunch_end) : null;
    
    const serviceDuration = selectedService.duration_minutes;
    const slots: string[] = [];
    
    const bookedRanges = bookedAppointments.map(app => {
      const start = new Date(app.start_datetime);
      const end = new Date(app.end_datetime);
      return {
        start: start.getHours() * 60 + start.getMinutes(),
        end: end.getHours() * 60 + end.getMinutes()
      };
    });

    const timeOffRanges = blockedTimes.map(timeOff => {
      return {
        start: timeOff.start.getHours() * 60 + timeOff.start.getMinutes(),
        end: timeOff.end.getHours() * 60 + timeOff.end.getMinutes()
      };
    });
    
    let currentMins = startMins;
    const slotInterval = 30; // 30 minutes blocks
    
    const today = new Date();
    const isToday = selectedDate.getDate() === today.getDate() && 
                    selectedDate.getMonth() === today.getMonth() && 
                    selectedDate.getFullYear() === today.getFullYear();
    const currentDayMins = today.getHours() * 60 + today.getMinutes();
    
    while (currentMins + serviceDuration <= endMins) {
      const slotStart = currentMins;
      const slotEnd = currentMins + serviceDuration;
      
      // Skip if in the past today (add 30 mins margin)
      if (isToday && slotStart <= currentDayMins + 30) {
        currentMins += slotInterval;
        continue;
      }
      
      const overlapsLunch = lunchStartMins !== null && lunchEndMins !== null &&
        (slotStart < lunchEndMins && slotEnd > lunchStartMins);
          
      const overlapsBooked = bookedRanges.some(booked => 
        (slotStart < booked.end && slotEnd > booked.start)
      );

      const overlapsTimeOff = timeOffRanges.some(blocked =>
        (slotStart < blocked.end && slotEnd > blocked.start)
      );
      
      if (!overlapsLunch && !overlapsBooked && !overlapsTimeOff) {
        slots.push(formatTime(slotStart));
      }
      
      currentMins += slotInterval;
    }
    
    return slots;
  };

  const handleBookAppointment = async () => {
    if (!profile || !selectedDate || !selectedBarber || !selectedService || !selectedTime) return;
    
    setIsBooking(true);
    
    const [startHours, startMinutes] = selectedTime.split(':').map(Number);
    const startDatetime = new Date(selectedDate);
    startDatetime.setHours(startHours, startMinutes, 0, 0);

    const endTotalMinutes = startHours * 60 + startMinutes + selectedService.duration_minutes;
    const endHours = Math.floor(endTotalMinutes / 60);
    const endMinutes = endTotalMinutes % 60;
    const endDatetime = new Date(selectedDate);
    endDatetime.setHours(endHours, endMinutes, 0, 0);

    const { error } = await supabase.from('appointments').insert({
      customer_id: profile.id,
      barber_id: selectedBarber.id,
      service_id: selectedService.id,
      start_datetime: startDatetime.toISOString(),
      end_datetime: endDatetime.toISOString(),
      status: 'CONFIRMED'
    });

    if (error) {
      alert('Erro ao agendar horário. Tente novamente.');
      console.error(error);
    } else {
      setToastMessage('Horário agendado com sucesso!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      // Reset flow
      setSelectedTime(null);
      setSelectedService(null);
      setSelectedBarber(null);
      setSelectedDate(null);
      setIsTimeSelectionVisible(false);
    }
    
    setIsBooking(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-24">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Agendar Horário</h1>
        <p className="text-zinc-500 mt-1">Escolha a data, o profissional e o serviço desejado.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Selection */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-8">
            
            {/* Step 1: Date Selection */}
            <section>
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center text-sm font-semibold shadow-sm">1</div>
                <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">Data do Atendimento</h2>
              </div>
              
              <div className="bg-white border border-zinc-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-zinc-900 capitalize">{formatMonthYear(currentMonth)}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={prevMonth}
                      disabled={isPrevMonthDisabled()}
                      className="p-1.5 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-1.5 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-y-4 gap-x-1 sm:gap-x-2 text-center mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {generateCalendarDays().map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="h-10 sm:h-12" />;
                    }
                    
                    const isSelected = selectedDate?.getTime() === date.getTime();
                    const isPast = isDateInPast(date);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        disabled={isPast}
                        className={`h-10 sm:h-12 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-zinc-900 text-white shadow-md'
                            : isPast
                            ? 'text-zinc-300 cursor-not-allowed'
                            : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Step 2: Barber Selection */}
            <section className={!selectedDate ? 'opacity-40 pointer-events-none transition-all duration-300' : 'transition-all duration-300'}>
              <div className="flex items-center gap-3 mb-4 sm:mb-5 mt-4">
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center text-sm font-semibold shadow-sm">2</div>
                <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">Profissional</h2>
              </div>
              
              {availableBarbers.length === 0 && selectedDate ? (
                <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-center">
                  <p className="text-zinc-500 text-sm">Nenhum profissional disponível nesta data.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {availableBarbers.map((barber) => {
                    const isSelected = selectedBarber?.id === barber.id;
                    return (
                      <button
                        key={barber.id}
                        onClick={() => setSelectedBarber(barber)}
                        className={`relative flex items-center gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-zinc-900 bg-zinc-900/5 shadow-sm'
                            : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm'
                        }`}
                      >
                        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div className="flex-1 pr-6">
                          <p className={`font-semibold ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`}>{barber.full_name}</p>
                          <p className="text-xs text-zinc-500 font-medium">Barbeiro</p>
                        </div>
                        {isSelected && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-900">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Step 3: Service Selection */}
            <section className={!selectedBarber ? 'opacity-40 pointer-events-none transition-all duration-300' : 'transition-all duration-300'}>
              <div className="flex items-center gap-3 mb-4 sm:mb-5 mt-4">
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center text-sm font-semibold shadow-sm">3</div>
                <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">Serviço</h2>
              </div>
              
              <div className="space-y-3">
                {services.map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`relative w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 gap-4 sm:gap-0 ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-900/5 shadow-sm'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="pr-0 sm:pr-12 w-full">
                        <p className={`font-semibold text-base sm:text-lg ${isSelected ? 'text-zinc-900' : 'text-zinc-800'}`}>{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{service.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-zinc-400" />
                            {service.duration_minutes} min
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-zinc-200/50 pt-3 sm:pt-0 w-full sm:w-auto">
                        <div className="bg-white border border-zinc-200 px-3 py-1.5 rounded-full shadow-sm">
                          <span className="font-bold text-zinc-900 whitespace-nowrap">
                            R$ {Number(service.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-zinc-900 mt-0 sm:mt-1 mr-0 sm:mr-1 hidden sm:block" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 4: Time Selection */}
            {isTimeSelectionVisible && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-4 sm:mb-5 mt-4">
                  <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center text-sm font-semibold shadow-sm">4</div>
                  <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">Horário</h2>
                </div>
                
                {isCheckingSlots ? (
                  <div className="flex justify-center p-8 bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                  </div>
                ) : (
                  <div className="bg-white border border-zinc-200 rounded-xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
                    {generateTimeSlots().length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-zinc-500 text-sm">Nenhum horário disponível para esta data.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                        {generateTimeSlots().map((time) => {
                          const isSelected = selectedTime === time;
                          return (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`py-2 sm:py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                isSelected
                                  ? 'bg-zinc-900 text-white shadow-md ring-2 ring-zinc-900 ring-offset-2'
                                  : 'bg-zinc-50 text-zinc-700 border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right Column: Date & Time & Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white border border-zinc-200 rounded-xl sm:rounded-3xl p-5 sm:p-7 sticky top-24 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-900 mb-5 sm:mb-6 tracking-tight">Resumo do Agendamento</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="pt-1">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Data</p>
                    <p className="text-base text-zinc-900 font-medium capitalize">
                      {selectedDate 
                        ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
                        : <span className="text-zinc-400 font-normal">Não selecionada</span>}
                    </p>
                    {selectedTime && (
                      <p className="text-sm font-semibold text-zinc-900 mt-1">
                        às {selectedTime}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="pt-1">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Profissional</p>
                    <p className="text-base text-zinc-900 font-medium">
                      {selectedBarber ? selectedBarber.full_name : <span className="text-zinc-400 font-normal">Não selecionado</span>}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                    <Scissors className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="pt-1 flex-1">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Serviço</p>
                    <p className="text-base text-zinc-900 font-medium">
                      {selectedService ? selectedService.name : <span className="text-zinc-400 font-normal">Não selecionado</span>}
                    </p>
                    {selectedService && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium text-zinc-500">
                          {selectedService.duration_minutes} min
                        </span>
                        <span className="font-semibold text-zinc-900">
                          R$ {Number(selectedService.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-200/60">
                {!isTimeSelectionVisible ? (
                  <>
                    <button
                      onClick={handleContinueToTimes}
                      disabled={!selectedDate || !selectedBarber || !selectedService}
                      className="w-full py-4 px-4 bg-zinc-900 text-white rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 transition-all duration-200 shadow-sm disabled:shadow-none"
                    >
                      Continuar para Horários
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    {(!selectedDate || !selectedBarber || !selectedService) && (
                      <p className="text-xs text-center text-zinc-500 mt-4">
                        Conclua as etapas acima para continuar.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleBookAppointment}
                      disabled={!selectedTime || isBooking}
                      className="w-full py-4 px-4 bg-zinc-900 text-white rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 transition-all duration-200 shadow-sm disabled:shadow-none"
                    >
                      {isBooking ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Confirmar Agendamento
                          <CheckCircle2 className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    {!selectedTime && (
                      <p className="text-xs text-center text-zinc-500 mt-4">
                        Selecione um horário para confirmar.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
        <div className="bg-zinc-900 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      </div>
    </div>
  );
};

