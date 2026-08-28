import { Suspense } from 'react';
import { CalendarCheck, CalendarPlus, LogOut, UserRound } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../ui/Logo';
import { PageTransition, RouteProgress } from './RouteProgress';
import { RouteSkeleton } from '../ui/Skeleton';

const ITEMS = [
  { icon: CalendarPlus, label: 'Agendar', path: '/customer', end: true },
  { icon: CalendarCheck, label: 'Meus horários', path: '/customer/appointments' },
  { icon: UserRound, label: 'Perfil', path: '/customer/profile' },
];

/** Salão: barra superior clara, conteúdo centrado, abas no celular. */
export const CustomerLayout = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const firstName = profile?.full_name?.split(' ')[0] ?? '';

  return (
    <div className="flex min-h-screen flex-col">
      <RouteProgress />

      <header className="sticky top-0 z-30 border-b border-line bg-porcelain/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-9">
            <NavLink to="/customer" aria-label="CutFlow, início">
              <Logo />
            </NavLink>

            <nav className="hidden items-center gap-7 sm:flex">
              {ITEMS.slice(0, 2).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `link-underline text-sm font-medium transition-colors ${
                      isActive ? 'text-ink' : 'text-smoke hover:text-ink'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-1 hidden text-right text-sm text-smoke sm:block">
              Olá, <span className="font-semibold text-ink">{firstName}</span>
            </span>
            <NavLink
              to="/customer/profile"
              className={({ isActive }) =>
                `icon-btn ${isActive ? 'bg-pine-wash text-pine' : ''}`
              }
              aria-label="Meu perfil"
            >
              <UserRound className="h-5 w-5" />
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="icon-btn icon-btn-danger"
              aria-label="Sair da conta"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 pb-28 sm:px-6 sm:pb-12">
        <AnimatePresence mode="wait">
          <PageTransition>
            <Suspense fallback={<RouteSkeleton />}>
              <Outlet />
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-porcelain/95 backdrop-blur-md pb-safe sm:hidden">
        <div className="flex items-stretch">
          {ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end} className="tab-item">
              <item.icon className="h-5 w-5" strokeWidth={1.9} />
              <span className="w-full truncate text-center">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
