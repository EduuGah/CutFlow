import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import * as AuthContext from '../../contexts/AuthContext';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  const renderRoute = (allowedRoles?: string[]) => {
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute allowedRoles={allowedRoles as any} />}>
            <Route index element={<div data-testid="protected-content">Conteudo Protegido</div>} />
          </Route>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route path="/admin" element={<div data-testid="admin-page">Admin Page</div>} />
          <Route path="/barber" element={<div data-testid="barber-page">Barber Page</div>} />
          <Route path="/customer" element={<div data-testid="customer-page">Customer Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders the boot screen while the session is being checked', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      profile: null,
      isLoading: true,
      refreshProfile: vi.fn(),
      session: null,
    });

    renderRoute();
    expect(screen.getByTestId('app-loading')).toBeInTheDocument();
  });

  it('redirects to login when no user is present', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      profile: null,
      isLoading: false,
      refreshProfile: vi.fn(),
      session: null,
    });

    renderRoute();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders outlet when user has allowed role', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { id: '123' } as any,
      profile: { role: 'ADMIN' } as any,
      isLoading: false,
      refreshProfile: vi.fn(),
      session: null,
    });

    renderRoute(['ADMIN']);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects CUSTOMER to customer dashboard if trying to access ADMIN route', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { id: '123' } as any,
      profile: { role: 'CUSTOMER' } as any,
      isLoading: false,
      refreshProfile: vi.fn(),
      session: null,
    });

    renderRoute(['ADMIN']);
    expect(screen.getByTestId('customer-page')).toBeInTheDocument();
  });

  it('redirects BARBER to barber dashboard if trying to access ADMIN route', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { id: '123' } as any,
      profile: { role: 'BARBER' } as any,
      isLoading: false,
      refreshProfile: vi.fn(),
      session: null,
    });

    renderRoute(['ADMIN']);
    expect(screen.getByTestId('barber-page')).toBeInTheDocument();
  });
});
