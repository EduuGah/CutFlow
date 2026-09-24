/**
 * Contas de demonstração, uma por perfil.
 *
 * Servem para quem chega pelo portfólio testar a agenda sem criar conta. O
 * script `docs/architecture/demo_accounts.sql` cria as três no Supabase.
 * As senhas são públicas de propósito: estão impressas na tela de login.
 */
export const DEMO_EMAIL_DOMAIN = 'demo.cutflow.app';

export const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin', label: 'Dono', description: 'Faturamento, equipe e serviços' },
  { username: 'barbeiro', password: 'barbeiro', label: 'Barbeiro', description: 'O dia de atendimentos e os bloqueios' },
  { username: 'cliente', password: 'cliente', label: 'Cliente', description: 'Marca um horário livre' },
] as const;

/**
 * O campo de login aceita e-mail ou usuário.
 *
 * O Supabase só entende e-mail; um usuário curto ("admin") vira o endereço
 * interno das contas de demonstração, que nunca recebe mensagem.
 */
export function resolveLoginEmail(input: string): string {
  const value = input.trim().toLowerCase();
  return value.includes('@') ? value : `${value}@${DEMO_EMAIL_DOMAIN}`;
}
