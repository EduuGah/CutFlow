import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { Pole } from '../ui/Pole';

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
    <Pole size="lg" tone="onDark" label="Carregando" />
    <p className="type-tag anim-fade text-white/45" style={{ ['--d' as string]: '250ms' }}>
      Abrindo a casa
    </p>
  </div>
);

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) return <BootScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to={HOME_BY_ROLE[profile.role] ?? '/customer'} replace />;
  }

  return <Outlet />;
};
