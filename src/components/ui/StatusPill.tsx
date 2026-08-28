import { Check, Clock3, Scissors, X } from 'lucide-react';
import { AppointmentStatus } from '../../types';

const MAP: Record<
  AppointmentStatus,
  { label: string; tone: string; icon: typeof Check }
> = {
  CONFIRMED: { label: 'Confirmado', tone: 'pill-brass', icon: Clock3 },
  IN_PROGRESS: { label: 'Na cadeira', tone: 'pill-cobalt', icon: Scissors },
  COMPLETED: { label: 'Concluído', tone: 'pill-verdigris', icon: Check },
  CANCELLED: { label: 'Cancelado', tone: 'pill-oxblood', icon: X },
};

export const StatusPill = ({
  status,
  className = '',
}: {
  status: AppointmentStatus;
  className?: string;
}) => {
  const entry = MAP[status];
  if (!entry) return null;
  const Icon = entry.icon;

  return (
    <span className={`pill ${entry.tone} ${className}`}>
      <Icon className="h-3 w-3" strokeWidth={2.75} />
      {entry.label}
    </span>
  );
};
