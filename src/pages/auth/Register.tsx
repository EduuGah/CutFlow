import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, UserRound } from 'lucide-react';

import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AuthShell } from '../../components/layout/AuthShell';
import { Button } from '../../components/ui/Button';
import { Field, Notice } from '../../components/ui/Field';

const HOME_BY_ROLE = { ADMIN: '/admin', BARBER: '/barber', CUSTOMER: '/customer' } as const;

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (profile) {
      navigate(HOME_BY_ROLE[profile.role] ?? '/customer', { replace: true });
    } else if (user && !authLoading) {
      setError(
        'A conta foi criada, mas o perfil não apareceu no banco. Rode o script SQL com a trigger no painel do Supabase.'
      );
      setIsSubmitting(false);
    }
  }, [profile, user, authLoading, navigate]);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setPending(null);

    // Nome e perfil vão nos metadados; a trigger handle_new_user copia
    // esses campos para public.users. Barbeiros e Admins são criados internamente.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role: 'CUSTOMER' } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (!data.session) {
      setPending(
        'Conta criada. O Supabase está pedindo confirmação por e-mail — abra a mensagem que chegou ou desligue "Confirm email" em Authentication › Providers › Email.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Criar conta"
      title="Comece pela cadeira"
      description="Poucos campos e você já entra direto na agenda."
      asideTitle="Uma conta, três salas."
      asideBody="Escolha como você entra: cliente que marca, barbeiro que atende ou dono que acompanha a casa."
      footer={
        <p>
          Já tem uma conta?{' '}
          <Link to="/login" className="link-underline font-semibold text-pine">
            Fazer login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleRegister} className="space-y-5" noValidate>
        {error && <Notice tone="error">{error}</Notice>}
        {pending && <Notice tone="info">{pending}</Notice>}

        <Field label="Nome completo" htmlFor="name" icon={UserRound}>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input input-icon"
            placeholder="Como quer ser chamado"
            disabled={isSubmitting}
          />
        </Field>

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
            disabled={isSubmitting}
          />
        </Field>

        <Field
          label="Senha"
          htmlFor="password"
          icon={Lock}
          hint="Mínimo de 6 caracteres."
        >
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input input-icon"
            placeholder="••••••••"
            disabled={isSubmitting}
          />
        </Field>

        <Button
          type="submit"
          block
          size="lg"
          loading={isSubmitting}
          loadingLabel="Criando conta"
          disabled={!name || !email || !password}
          className="mt-2"
        >
          Criar conta
        </Button>
      </form>
    </AuthShell>
  );
};
