import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  /** Uma tela vazia é um convite: diga o próximo passo, não peça desculpas. */
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="card anim-rise flex flex-col items-center px-6 py-14 text-center">
    <span className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-pine-wash text-pine">
      <Icon className="h-6 w-6" strokeWidth={1.75} />
      <span
        className="pole absolute -right-2 -bottom-2 h-6 w-2.5"
        style={{ ['--pole-a' as string]: '#bd8a2c', ['--pole-b' as string]: '#14392e' }}
        aria-hidden="true"
      >
        <span className="pole-stripes pole-stripes-still absolute inset-0" />
      </span>
    </span>
    <h3 className="type-sign text-lg text-ink">{title}</h3>
    <p className="mt-2 max-w-sm text-sm leading-relaxed text-smoke">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);
