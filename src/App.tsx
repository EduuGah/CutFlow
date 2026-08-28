import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { BarberLayout } from './components/layout/BarberLayout';
import { CustomerLayout } from './components/layout/CustomerLayout';

// Pages placeholders
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { BarberDashboard } from './pages/barber/BarberDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ServicesManagement } from './pages/admin/ServicesManagement';
import { BarbersManagement } from './pages/admin/BarbersManagement';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rota inicial provisória para testes */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rotas Protegidas - Clientes */}
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
            <Route element={<CustomerLayout />}>
              <Route path="/customer" element={<CustomerDashboard />} />
            </Route>
          </Route>

          {/* Rotas Protegidas - Barbeiros */}
          <Route element={<ProtectedRoute allowedRoles={['BARBER']} />}>
            <Route element={<BarberLayout />}>
              <Route path="/barber" element={<BarberDashboard />} />
            </Route>
          </Route>

          {/* Rotas Protegidas - Admin */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/services" element={<ServicesManagement />} />
              <Route path="/admin/barbers" element={<BarbersManagement />} />
              {/* Future admin routes will go here (Schedule, etc) */}
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

