import React, { useEffect, useState } from 'react';
import { Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Field, Notice } from '../../components/ui/Field';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administração',
  BARBER: 'Barbeiro',
  CUSTOMER: 'Cliente',
};

/** Máscara de telefone brasileiro: fixo com 10 dígitos, celular com 11. */
const formatPhone = (value: string) => {
  let digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 10) {
    digits = digits.replace(/(\d{2})(\d)/, '($1) $2');
    digits = digits.replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    digits = digits.replace(/(\d{2})(\d)/, '($1) $2');
    digits = digits.replace(/(\d{5})(\d)/, '$1-$2');
  }
  return digits;
};

const initials = (name?: string | null) =>
  (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '—';

export const ProfileSettings = () => {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setIsLoading(false);
    }
  }, [profile]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('users')
      .update({ full_name: fullName, phone: phone || null })
      .eq('id', profile.id);

    setIsSaving(false);

    if (updateError) {
      console.error(updateError);
      setError(`As alterações não foram salvas: ${updateError.message}`);
      return;
    }

    toast.success('Perfil atualizado.');
    await refreshProfile();
  };

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Perfil"
        title="Suas informações"
        description="É por aqui que a barbearia identifica e entra em contato com você."
      />

      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-4 border-b border-line-soft pb-7">
          <span className="anim-pop flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-pine text-xl font-bold text-white">
            {initials(profile?.full_name)}
          </span>
          <div className="min-w-0">
            <h2 className="type-sign truncate text-xl text-ink">{profile?.full_name}</h2>
            <p className="type-tag mt-2 inline-flex items-center gap-1.5 text-brass-deep">
              <ShieldCheck className="h-3.5 w-3.5" />
              {ROLE_LABEL[profile?.role ?? ''] ?? 'Conta'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-7">
          {error && <Notice tone="error">{error}</Notice>}

          <Field
            label="E-mail"
            htmlFor="profile-email"
            icon={Mail}
            hint="O e-mail de acesso é alterado direto no Supabase."
          >
            <input
              id="profile-email"
              type="email"
              disabled
              value={profile?.email || ''}
              className="input input-icon"
            />
          </Field>

          <Field label="Nome completo" htmlFor="profile-name" icon={UserRound}>
            <input
              id="profile-name"
              type="text"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="input input-icon"
            />
          </Field>

          <Field
            label="Telefone / WhatsApp"
            htmlFor="profile-phone"
            icon={Phone}
            hint="Aparece para o barbeiro na agenda do dia."
          >
            <input
              id="profile-phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(event) => setPhone(formatPhone(event.target.value))}
              className="input input-icon"
            />
          </Field>

          <div className="pt-3">
            <Button type="submit" size="lg" loading={isSaving} loadingLabel="Salvando">
              Salvar alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
