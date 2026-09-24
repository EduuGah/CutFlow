import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Lock, Mail } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AuthShell } from '../../components/layout/AuthShell';
import { Button } from '../../components/ui/Button';
import { Field, Notice } from '../../components/ui/Field';
import { DEMO_ACCOUNTS, resolveLoginEmail } from '../../config/demo';

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

  const signIn = async (identifier: string, secret: string) => {
    setIsSigningIn(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: resolveLoginEmail(identifier),
      password: secret,
    });

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Usuário ou senha não conferem. Confira os dois e tente de novo.'
          : authError.message
      );
      setIsSigningIn(false);
    }
    // No sucesso, o AuthContext carrega o perfil e o efeito acima redireciona.
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    signIn(email, password);
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

        <Field label="E-mail ou usuário" htmlFor="email" icon={Mail}>
          <input
            id="email"
            type="text"
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
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

      <section
        aria-labelledby="demo-title"
        className="mt-8 rounded-xl border border-dashed border-brass/40 bg-brass-wash px-4 py-4"
      >
        <h2 id="demo-title" className="flex items-center gap-2 text-sm font-semibold text-brass-deep">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Testar sem criar conta
        </h2>
        <p className="mt-1 text-sm text-brass-deep/80">
          Entre numa barbearia de demonstração com um clique, ou digite usuário <strong>admin</strong> e
          senha <strong>admin</strong>.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {DEMO_ACCOUNTS.map((account) => (
            <Button
              key={account.username}
              type="button"
              variant="outline"
              size="sm"
              block
              title={account.description}
              disabled={isSigningIn}
              onClick={() => signIn(account.username, account.password)}
            >
              {account.label}
            </Button>
          ))}
        </div>
      </section>
    </AuthShell>
  );
};
