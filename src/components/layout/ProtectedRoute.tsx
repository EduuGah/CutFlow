import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Logo } from '../ui/Logo';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const HOME_BY_ROLE: Record<UserRole, string> = {
  ADMIN: '/admin',
  BARBER: '/barber',
  CUSTOMER: '/customer',
};

/** Tela de abertura enquanto a sessão é verificada. */
export const BootScreen = () => (
  <div
    data-testid="app-loading"
    className="flex min-h-screen flex-col items-center justify-center gap-6 bg-pine px-6"
  >
    <Logo tone="dark" className="scale-125" />
    <div className="flex items-center gap-3 mt-4 text-white/45">
      <Loader2 className="h-5 w-5 animate-spin" />
      <p className="type-tag anim-fade" style={{ ['--d' as string]: '250ms' }}>
        Abrindo a casa...
      </p>
    </div>
  </div>
);

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) return <BootScreen />;

  if (!user) return <Navigate to="/login" replace />;

  // Se houver restrição de rotas, precisamos aguardar o perfil carregar
  if (allowedRoles) {
    if (!profile) return <BootScreen />;
    
    if (!allowedRoles.includes(profile.role)) {
      return <Navigate to={HOME_BY_ROLE[profile.role] ?? '/customer'} replace />;
    }
  }

  return <Outlet />;
};
