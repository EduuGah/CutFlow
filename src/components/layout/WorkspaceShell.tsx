import { Suspense } from 'react';
import { LogOut, LucideIcon } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../ui/Logo';
import { PageTransition, RouteProgress } from './RouteProgress';
import { RouteSkeleton } from '../ui/Skeleton';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  /** Rótulo curto para a barra inferior do celular. */
  short: string;
  path: string;
  end?: boolean;
}

interface WorkspaceShellProps {
  items: NavItem[];
  /** Sufixo do logotipo: identifica o posto de trabalho. */
  suffix: string;
  roleLabel: string;
  profilePath: string;
}

const initials = (name?: string | null) =>
  (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '—';

/**
 * Casa de máquinas: barra lateral verde-garrafa no desktop, cabeçalho +
 * abas inferiores no celular. Usado por barbeiro e administração.
 */
export const WorkspaceShell = ({ items, suffix, roleLabel, profilePath }: WorkspaceShellProps) => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <RouteProgress />

      {/* Cabeçalho — celular */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-pine px-4 md:hidden">
        <Logo tone="light" suffix={suffix} />
        <div className="flex items-center gap-1">
          <NavLink
            to={profilePath}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-brass text-sm font-bold text-pine-deep press"
            aria-label="Meu perfil"
          >
            {initials(profile?.full_name)}
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="icon-btn text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Sair da conta"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Barra lateral — desktop */}
      <aside className="relative hidden w-64 flex-none flex-col bg-pine md:sticky md:top-0 md:flex md:h-screen">
        <div className="px-6 py-6">
          <Logo tone="light" suffix={suffix} />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-6 py-2">
          {items.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className="nav-item anim-rise-sm"
              style={{ ['--d' as string]: `${index * 45}ms` }}
            >
              <item.icon className="h-[1.125rem] w-[1.125rem] flex-none" strokeWidth={1.9} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-6">
          <NavLink
            to={profilePath}
            className="mb-4 flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-white/7"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-brass text-sm font-bold text-pine-deep">
              {initials(profile?.full_name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{profile?.full_name}</p>
              <p className="type-tag mt-1 text-white/40">{roleLabel}</p>
            </div>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="nav-item w-full text-white/55 hover:bg-oxblood/25 hover:text-white"
          >
            <LogOut className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.9} />
            Sair
          </button>
        </div>

        {/* Trilho listrado: a divisa da casa. */}
        <span
          className="pole-stripes pole-stripes-still absolute inset-y-0 right-0 w-1"
          style={{ ['--pole-a' as string]: '#bd8a2c', ['--pole-b' as string]: '#0f2a22' }}
          aria-hidden="true"
        />
      </aside>

      {/* Conteúdo */}
      <main className="min-w-0 flex-1 px-4 pt-6 pb-28 sm:px-6 md:px-10 md:py-10">
        <AnimatePresence mode="wait">
          <PageTransition>
            <Suspense fallback={<RouteSkeleton />}>
              <Outlet />
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Abas — celular */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-porcelain/95 backdrop-blur-md pb-safe md:hidden">
        <div className="flex items-stretch">
          {items.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end} className="tab-item">
              <item.icon className="h-5 w-5" strokeWidth={1.9} />
              <span className="w-full truncate text-center">{item.short}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
