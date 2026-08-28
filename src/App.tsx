import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { BootScreen, ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { BarberLayout } from './components/layout/BarberLayout';
import { CustomerLayout } from './components/layout/CustomerLayout';

/**
 * Cada tela vira um pedaço próprio do bundle. A entrada carrega só o que a
 * pessoa vê primeiro; o painel do dono, que traz os gráficos, só chega quando
 * o dono entra.
 */
const page = <T extends Record<string, unknown>>(loader: () => Promise<T>, name: keyof T) =>
  lazy(async () => ({ default: (await loader())[name] as React.ComponentType }));

const Landing = page(() => import('./pages/public/Landing'), 'Landing');
const Login = page(() => import('./pages/auth/Login'), 'Login');
const Register = page(() => import('./pages/auth/Register'), 'Register');
const NotFound = page(() => import('./pages/public/NotFound'), 'NotFound');

const CustomerDashboard = page(
  () => import('./pages/customer/CustomerDashboard'),
  'CustomerDashboard'
);
const CustomerAppointments = page(
  () => import('./pages/customer/CustomerAppointments'),
  'CustomerAppointments'
);

const BarberDashboard = page(() => import('./pages/barber/BarberDashboard'), 'BarberDashboard');
const BarberTimeOffs = page(() => import('./pages/barber/BarberTimeOffs'), 'BarberTimeOffs');

const AdminDashboard = page(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const ServicesManagement = page(
  () => import('./pages/admin/ServicesManagement'),
  'ServicesManagement'
);
const BarbersManagement = page(
  () => import('./pages/admin/BarbersManagement'),
  'BarbersManagement'
);
const AdminSchedule = page(() => import('./pages/admin/AdminSchedule'), 'AdminSchedule');
const AdminTimeOffs = page(() => import('./pages/admin/AdminTimeOffs'), 'AdminTimeOffs');
const ProfileSettings = page(() => import('./pages/shared/ProfileSettings'), 'ProfileSettings');

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<BootScreen />}>
            <Routes>
              {/* Público */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Clientes */}
              <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
                <Route element={<CustomerLayout />}>
                  <Route path="/customer" element={<CustomerDashboard />} />
                  <Route path="/customer/appointments" element={<CustomerAppointments />} />
                  <Route path="/customer/profile" element={<ProfileSettings />} />
                </Route>
              </Route>

              {/* Barbeiros */}
              <Route element={<ProtectedRoute allowedRoles={['BARBER']} />}>
                <Route element={<BarberLayout />}>
                  <Route path="/barber" element={<BarberDashboard />} />
                  <Route path="/barber/time-offs" element={<BarberTimeOffs />} />
                  <Route path="/barber/profile" element={<ProfileSettings />} />
                </Route>
              </Route>

              {/* Administração */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/schedule" element={<AdminSchedule />} />
                  <Route path="/admin/barbers" element={<BarbersManagement />} />
                  <Route path="/admin/services" element={<ServicesManagement />} />
                  <Route path="/admin/time-offs" element={<AdminTimeOffs />} />
                  <Route path="/admin/profile" element={<ProfileSettings />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
