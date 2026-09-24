import { describe, expect, it } from 'vitest';
import { DEMO_ACCOUNTS, DEMO_EMAIL_DOMAIN, resolveLoginEmail } from './demo';

describe('login com usuário de demonstração', () => {
  it('transforma o usuário no endereço interno', () => {
    expect(resolveLoginEmail('admin')).toBe(`admin@${DEMO_EMAIL_DOMAIN}`);
    expect(resolveLoginEmail('  Barbeiro ')).toBe(`barbeiro@${DEMO_EMAIL_DOMAIN}`);
  });

  it('mantém e-mails de verdade como vieram', () => {
    expect(resolveLoginEmail('Cliente@Gmail.com')).toBe('cliente@gmail.com');
  });

  it('tem uma conta para cada perfil do sistema', () => {
    expect(DEMO_ACCOUNTS.map((a) => a.username)).toEqual(['admin', 'barbeiro', 'cliente']);
  });
});
