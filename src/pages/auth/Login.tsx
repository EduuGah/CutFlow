import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AuthShell } from '../../components/layout/AuthShell';
import { Button } from '../../components/ui/Button';
import { Field, Notice } from '../../components/ui/Field';

const HOME_BY_ROLE = { ADMIN: '/admin', BARBER: '/barber', CUSTOMER: '/customer' } as const;

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      navigate(HOME_BY_ROLE[profile.role] ?? '/customer', { replace: true });
    } else if (user && !authLoading) {
      setError(
        'A senha confere, mas esta conta não tem perfil no banco. Rode o script SQL do projeto no painel do Supabase e tente de novo.'
      );
      setIsSigningIn(false);
    }
  }, [profile, user, authLoading, navigate]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSigningIn(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'E-mail ou senha não conferem. Confira os dois e tente de novo.'
          : authError.message
      );
      setIsSigningIn(false);
    }
    // No sucesso, o AuthContext carrega o perfil e o efeito acima redireciona.
  };

  return (
    <AuthShell
      eyebrow="Entrar"
      title="Bem-vindo de volta"
      description="Acesse para ver seus horários e marcar o próximo corte."
      asideTitle="A agenda da casa, aberta o tempo todo."
      asideBody="Cliente marca sozinho, barbeiro comanda o dia e o dono acompanha tudo — na mesma tela."
      footer={
        <p>
          Ainda não tem conta?{' '}
          <Link to="/register" className="link-underline font-semibold text-pine">
            Criar uma agora
          </Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5" noValidate>
        {error && <Notice tone="error">{error}</Notice>}

        <Field label="E-mail" htmlFor="email" icon={Mail}>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input input-icon"
            placeholder="voce@email.com"
            disabled={isSigningIn}
          />
        </Field>

        <Field label="Senha" htmlFor="password" icon={Lock}>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input input-icon"
            placeholder="••••••••"
            disabled={isSigningIn}
          />
        </Field>

        <Button
          type="submit"
          block
          size="lg"
          loading={isSigningIn}
          loadingLabel="Entrando"
          disabled={!email || !password}
          className="mt-2"
        >
          Entrar
        </Button>
      </form>
    </AuthShell>
  );
};
