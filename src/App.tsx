import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { BarberLayout } from './components/layout/BarberLayout';
import { CustomerLayout } from './components/layout/CustomerLayout';

import { Landing } from './pages/public/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerAppointments } from './pages/customer/CustomerAppointments';
import { BarberDashboard } from './pages/barber/BarberDashboard';
import { BarberTimeOffs } from './pages/barber/BarberTimeOffs';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ServicesManagement } from './pages/admin/ServicesManagement';
import { BarbersManagement } from './pages/admin/BarbersManagement';
import { AdminSchedule } from './pages/admin/AdminSchedule';
import { AdminTimeOffs } from './pages/admin/AdminTimeOffs';
import { ProfileSettings } from './pages/shared/ProfileSettings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas Protegidas - Clientes */}
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
            <Route element={<CustomerLayout />}>
              <Route path="/customer" element={<CustomerDashboard />} />
              <Route path="/customer/appointments" element={<CustomerAppointments />} />
              <Route path="/customer/profile" element={<ProfileSettings />} />
            </Route>
          </Route>

          {/* Rotas Protegidas - Barbeiros */}
          <Route element={<ProtectedRoute allowedRoles={['BARBER']} />}>
            <Route element={<BarberLayout />}>
              <Route path="/barber" element={<BarberDashboard />} />
              <Route path="/barber/time-offs" element={<BarberTimeOffs />} />
              <Route path="/barber/profile" element={<ProfileSettings />} />
            </Route>
          </Route>

          {/* Rotas Protegidas - Admin */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/services" element={<ServicesManagement />} />
              <Route path="/admin/barbers" element={<BarbersManagement />} />
              <Route path="/admin/schedule" element={<AdminSchedule />} />
              <Route path="/admin/time-offs" element={<AdminTimeOffs />} />
              <Route path="/admin/profile" element={<ProfileSettings />} />
            </Route>
          </Route>
          
          {/* Rota 404 de fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

