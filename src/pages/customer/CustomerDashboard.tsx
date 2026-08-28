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

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Agendar Horário</h1>
        <p className="text-zinc-500 mt-1">Escolha a data, o profissional e o serviço desejado.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Selection */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* Step 1: Date Selection */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center text-sm font-semibold shadow-sm">1</div>
                <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Data do Atendimento</h2>
              </div>
              
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm">
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
              <div className="flex items-center gap-3 mb-5 mt-4">
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center text-sm font-semibold shadow-sm">2</div>
                <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Profissional</h2>
              </div>
              
              {availableBarbers.length === 0 && selectedDate ? (
                <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-center">
                  <p className="text-zinc-500 text-sm">Nenhum profissional disponível nesta data.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableBarbers.map((barber) => {
                    const isSelected = selectedBarber?.id === barber.id;
                    return (
                      <button
                        key={barber.id}
                        onClick={() => setSelectedBarber(barber)}
                        className={`relative flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
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
              <div className="flex items-center gap-3 mb-5 mt-4">
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center text-sm font-semibold shadow-sm">3</div>
                <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Serviço</h2>
              </div>
              
              <div className="space-y-3">
                {services.map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`relative w-full flex items-center justify-between p-5 rounded-2xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-900/5 shadow-sm'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="pr-12">
                        <p className={`font-semibold text-lg ${isSelected ? 'text-zinc-900' : 'text-zinc-800'}`}>{service.name}</p>
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
                      <div className="flex flex-col items-end gap-2 pl-4 border-l border-zinc-200/50">
                        <div className="bg-white border border-zinc-200 px-3 py-1.5 rounded-full shadow-sm">
                          <span className="font-bold text-zinc-900 whitespace-nowrap">
                            R$ {Number(service.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-zinc-900 mt-1 mr-1" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Date & Time & Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white border border-zinc-200 rounded-3xl p-7 sticky top-24 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900 mb-6 tracking-tight">Resumo do Agendamento</h3>
              
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
                <button
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
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

