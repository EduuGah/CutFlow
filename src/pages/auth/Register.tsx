import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Shield } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();

  // Redireciona o usuário caso ele já esteja logado e o perfil carregado
  useEffect(() => {
    if (profile) {
      if (profile.role === 'ADMIN') navigate('/admin', { replace: true });
      else if (profile.role === 'BARBER') navigate('/barber', { replace: true });
      else navigate('/customer', { replace: true });
    } else if (user && !authLoading) {
      setError("Conta criada, mas perfil não encontrado. Você rodou o script SQL com a Trigger no painel do Supabase?");
      setIsLoading(false);
    }
  }, [profile, user, authLoading, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // No Supabase, passamos os metadados (nome e role) no signUp.
    // O nosso Trigger no banco de dados (handle_new_user) vai pegar esses dados 
    // e inserir automaticamente na tabela public.users.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
    } else {
      if (!data.session) {
        setError('Cadastro realizado! O Supabase exige confirmação. Verifique seu e-mail ou desative a "Confirm email" no painel do Supabase (Authentication > Providers > Email).');
        setIsLoading(false);
      }
      // Se tiver sessão, o useEffect acima fará o redirecionamento automaticamente.
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Criar Conta</h1>
          <p className="text-zinc-500 mt-2 text-sm text-center">
            Cadastre-se para testar o sistema
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700">
              Nome Completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400"
                placeholder="Seu nome"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400"
                placeholder="seu@email.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Senha (mínimo 6 caracteres)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role" className="text-sm font-medium text-zinc-700">
              Perfil de Teste
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-zinc-400" />
              </div>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all appearance-none"
                disabled={isLoading}
              >
                <option value="CUSTOMER">Cliente (Customer)</option>
                <option value="BARBER">Barbeiro (Barber)</option>
                <option value="ADMIN">Administrador (Admin)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password || !name}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              'Cadastrar'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-zinc-900 hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
