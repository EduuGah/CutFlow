import { CalendarDays, CalendarOff } from 'lucide-react';
import { NavItem, WorkspaceShell } from './WorkspaceShell';

const ITEMS: NavItem[] = [
  { icon: CalendarDays, label: 'Meu dia', short: 'Meu dia', path: '/barber', end: true },
  { icon: CalendarOff, label: 'Ausências', short: 'Ausências', path: '/barber/time-offs' },
];

export const BarberLayout = () => (
  <WorkspaceShell
    items={ITEMS}
    suffix="Pro"
    roleLabel="Barbeiro"
    profilePath="/barber/profile"
  />
);
