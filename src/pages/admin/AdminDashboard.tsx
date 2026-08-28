import { Suspense, lazy, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, CalendarDays, Scissors, TrendingUp, Users } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { PageHeader } from '../../components/ui/PageHeader';
import { Reveal } from '../../components/ui/Reveal';
import { ChartSkeleton, StatGridSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import type { RevenuePoint } from './RevenueChart';

const RevenueChart = lazy(() => import('./RevenueChart'));

interface Stats {
  appointmentsToday: number;
  activeBarbers: number;
  totalServices: number;
  revenueToday: number;
}

const brl = (value: number) =>
  Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const priceOf = (service: unknown): number => {
  if (!service) return 0;
  const record = Array.isArray(service) ? service[0] : service;
  return Number((record as { price?: number })?.price ?? 0);
};

const SHORTCUTS = [
  {
    to: '/admin/schedule',
    icon: CalendarDays,
    title: 'Agenda da casa',
    body: 'Veja o dia de toda a equipe em uma tela só.',
  },
  {
    to: '/admin/barbers',
    icon: Users,
    title: 'Equipe',
    body: 'Defina os horários de trabalho de cada profissional.',
  },
  {
    to: '/admin/services',
    icon: Scissors,
    title: 'Catálogo de serviços',
    body: 'Ajuste preços, durações e o que fica no ar.',
  },
];

export const AdminDashboard = () => {
  const toast = useToast();
  const [stats, setStats] = useState<Stats>({
    appointmentsToday: 0,
    activeBarbers: 0,
    totalServices: 0,
    revenueToday: 0,
  });
  const [chartData, setChartData] = useState<RevenuePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const today = new Date();

      try {
        const [recentRes, todayRes, barbersRes, servicesRes] = await Promise.all([
          supabase
            .from('appointments')
            .select('start_datetime, status, service:services(price)')
            .gte('start_datetime', startOfDay(subDays(today, 6)).toISOString())
            .lte('start_datetime', endOfDay(today).toISOString()),
          supabase
            .from('appointments')
            .select('id, status, service:services(price)')
            .gte('start_datetime', startOfDay(today).toISOString())
            .lte('start_datetime', endOfDay(today).toISOString()),
          supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'BARBER'),
          supabase.from('services').select('id', { count: 'exact', head: true }),
        ]);

        const todayAppointments = todayRes.data ?? [];
        const revenueToday = todayAppointments
          .filter((item) => item.status !== 'CANCELLED')
          .reduce((sum, item) => sum + priceOf(item.service), 0);

        // Sete colunas fixas: dias sem movimento também contam a história.
        const buckets = new Map<string, number>();
        for (let offset = 6; offset >= 0; offset -= 1) {
          buckets.set(format(subDays(today, offset), 'dd/MM'), 0);
        }
        (recentRes.data ?? []).forEach((item) => {
          if (item.status === 'CANCELLED') return;
          const key = format(new Date(item.start_datetime), 'dd/MM');
          if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + priceOf(item.service));
        });

        setChartData([...buckets].map(([date, revenue]) => ({ date, revenue })));
        setStats({
          appointmentsToday: todayAppointments.length,
          activeBarbers: barbersRes.count ?? 0,
          totalServices: servicesRes.count ?? 0,
          revenueToday,
        });
      } catch (error) {
        console.error(error);
        toast.error('Não deu para carregar os números de hoje.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow="Visão geral"
        title="A casa hoje"
        description={format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR }).replace(
          /^./,
          (c) => c.toUpperCase()
        )}
      />

      {isLoading ? (
        <>
          <StatGridSkeleton />
          <ChartSkeleton />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              index={0}
              label="Atendimentos hoje"
              value={String(stats.appointmentsToday)}
              icon={CalendarDays}
            />
            <StatCard
              index={1}
              label="Receita do dia"
              value={`R$ ${brl(stats.revenueToday)}`}
              icon={TrendingUp}
              accent
            />
            <StatCard
              index={2}
              label="Barbeiros"
              value={String(stats.activeBarbers)}
              icon={Users}
            />
            <StatCard
              index={3}
              label="Serviços"
              value={String(stats.totalServices)}
              icon={Scissors}
            />
          </div>

          <Reveal>
            <section className="card p-5 sm:p-6">
              <header className="mb-6 flex items-center gap-3.5">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-pine-wash text-pine">
                  <TrendingUp className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <div>
                  <h2 className="type-sign text-lg text-ink">Faturamento dos últimos 7 dias</h2>
                  <p className="mt-1 text-sm text-smoke">
                    Soma dos serviços de todos os atendimentos não cancelados.
                  </p>
                </div>
              </header>

              <Suspense fallback={<div className="h-64 skeleton rounded-lg sm:h-72" />}>
                <RevenueChart data={chartData} />
              </Suspense>
            </section>
          </Reveal>

          <Reveal delay={80}>
            <section>
              <h2 className="type-sign mb-4 text-lg text-ink">Atalhos</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {SHORTCUTS.map((shortcut) => (
                  <NavLink
                    key={shortcut.to}
                    to={shortcut.to}
                    className="card card-interactive group flex flex-col gap-4 p-5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-chalk text-pine transition-colors duration-300 group-hover:bg-pine group-hover:text-white">
                      <shortcut.icon className="h-5 w-5" strokeWidth={1.9} />
                    </span>
                    <span>
                      <span className="flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink">
                        {shortcut.title}
                        <ArrowRight className="h-4 w-4 text-ash transition-transform duration-300 group-hover:translate-x-1 group-hover:text-pine" />
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-smoke">
                        {shortcut.body}
                      </span>
                    </span>
                  </NavLink>
                ))}
              </div>
            </section>
          </Reveal>
        </>
      )}
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  index,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof CalendarDays;
  index: number;
  accent?: boolean;
}) => (
  <div
    className={`anim-rise-sm relative overflow-hidden rounded-xl border p-4 sm:p-5 ${
      accent ? 'border-pine bg-pine text-white' : 'card'
    }`}
    style={{ ['--d' as string]: `${index * 70}ms` }}
  >
    <div className="flex items-center gap-2.5">
      <Icon
        className={`h-4 w-4 ${accent ? 'text-brass-bright' : 'text-ash'}`}
        strokeWidth={1.9}
      />
      <p className={`type-tag ${accent ? 'text-white/55' : 'text-ash'}`}>{label}</p>
    </div>
    <p className={`type-display mt-4 text-3xl sm:text-[2.1rem] ${accent ? 'text-white' : 'text-ink'}`}>
      {value}
    </p>
    {accent && (
      <span
        className="pole-stripes pole-stripes-still absolute inset-y-0 right-0 w-1"
        style={{ ['--pole-a' as string]: '#e6bc68', ['--pole-b' as string]: '#0f2a22' }}
        aria-hidden="true"
      />
    )}
  </div>
);
