import React from 'react';
import { AlertTriangle, CheckCircle2, Info, LucideIcon } from 'lucide-react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  icon?: LucideIcon;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/** Rótulo + ícone opcional + dica. O controle entra como filho. */
export const Field = ({ label, htmlFor, icon: Icon, hint, children, className = '' }: FieldProps) => (
  <div className={className}>
    <label className="label" htmlFor={htmlFor}>
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          className="pointer-events-none absolute top-1/2 left-3.5 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-ash"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
    {hint && <p className="mt-2 text-xs leading-relaxed text-ash">{hint}</p>}
  </div>
);

type NoticeTone = 'error' | 'success' | 'info';

const NOTICE: Record<NoticeTone, { icon: LucideIcon; className: string }> = {
  error: { icon: AlertTriangle, className: 'bg-oxblood-wash text-oxblood border-oxblood/20' },
  success: { icon: CheckCircle2, className: 'bg-verdigris-wash text-verdigris border-verdigris/20' },
  info: { icon: Info, className: 'bg-brass-wash text-brass-deep border-brass/25' },
};

/** Mensagem inline. Diz o que aconteceu e, quando dá, como resolver. */
export const Notice = ({
  tone = 'info',
  children,
  className = '',
}: {
  tone?: NoticeTone;
  children: React.ReactNode;
  className?: string;
}) => {
  const { icon: Icon, className: skin } = NOTICE[tone];

  return (
    <div
      className={`anim-rise-sm flex items-start gap-3 rounded-xl border px-4 py-3.5 ${skin} ${className}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 h-[1.125rem] w-[1.125rem] flex-none" strokeWidth={2.25} />
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
};
