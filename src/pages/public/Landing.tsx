import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Calendar, Clock, Star, ArrowRight } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-md">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900">CutFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
            Entrar
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-full shadow-md hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95">
            Criar Conta
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-200/50 text-zinc-700 text-sm font-medium mb-8">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          A barbearia do futuro chegou
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 tracking-tight max-w-4xl leading-[1.1]">
          Seu estilo, seu tempo, <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-900">nossa prioridade.</span>
        </h1>
        
        <p className="mt-8 text-lg md:text-xl text-zinc-500 max-w-2xl font-medium leading-relaxed">
          Agende seu horário em segundos com os melhores profissionais da cidade. 
          Sem ligações, sem espera. Simples e direto ao ponto.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white text-lg font-bold rounded-2xl shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            Agendar Agora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm text-left">
            <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6 text-zinc-900" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3">Agenda Inteligente</h3>
            <p className="text-zinc-500 font-medium">Veja os horários disponíveis em tempo real e escolha o que melhor se adapta à sua rotina.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm text-left relative overflow-hidden">
            <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Scissors className="w-6 h-6 text-zinc-900" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3 relative z-10">Serviços Premium</h3>
            <p className="text-zinc-500 font-medium relative z-10">De cortes clássicos a tratamentos completos, tudo com a máxima qualidade e cuidado.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm text-left">
            <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-zinc-900" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3">Zero Espera</h3>
            <p className="text-zinc-500 font-medium">Chegue no horário marcado e seja atendido imediatamente. Valorizamos o seu tempo.</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-zinc-900" />
            <span className="font-bold text-zinc-900 tracking-tight">CutFlow</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium">© {new Date().getFullYear()} CutFlow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
