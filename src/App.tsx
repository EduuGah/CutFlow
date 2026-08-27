import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages placeholders
import { Login } from './pages/auth/Login';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { BarberDashboard } from './pages/barber/BarberDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          
          {/* Rota inicial provisória para testes */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rotas Protegidas - Clientes */}
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
            <Route path="/customer" element={<CustomerDashboard />} />
          </Route>

          {/* Rotas Protegidas - Barbeiros */}
          <Route element={<ProtectedRoute allowedRoles={['BARBER']} />}>
            <Route path="/barber" element={<BarberDashboard />} />
          </Route>

          {/* Rotas Protegidas - Admin */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          
          {/* Rota 404 de fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

