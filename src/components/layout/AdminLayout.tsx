import { CalendarDays, CalendarOff, LayoutDashboard, Scissors, Users } from 'lucide-react';
import { NavItem, WorkspaceShell } from './WorkspaceShell';

const ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Visão geral', short: 'Geral', path: '/admin', end: true },
  { icon: CalendarDays, label: 'Agenda da casa', short: 'Agenda', path: '/admin/schedule' },
  { icon: Users, label: 'Equipe', short: 'Equipe', path: '/admin/barbers' },
  { icon: Scissors, label: 'Serviços', short: 'Serviços', path: '/admin/services' },
  { icon: CalendarOff, label: 'Bloqueios', short: 'Bloqueios', path: '/admin/time-offs' },
];

export const AdminLayout = () => (
  <WorkspaceShell
    items={ITEMS}
    suffix="Admin"
    roleLabel="Administração"
    profilePath="/admin/profile"
  />
);
