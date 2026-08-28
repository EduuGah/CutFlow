import React from 'react';

interface PageHeaderProps {
  /** Rótulo curto acima do título — diz onde o usuário está. */
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({ eyebrow, title, description, actions }: PageHeaderProps) => (
  <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <p className="type-tag anim-fade flex items-center gap-2 text-brass-deep">
        <span className="h-px w-6 bg-brass/60" aria-hidden="true" />
        {eyebrow}
      </p>
      <h1 className="type-display anim-rise mt-3 text-[2.1rem] text-ink sm:text-[2.6rem]" style={{ ['--d' as string]: '60ms' }}>
        {title}
      </h1>
      {description && (
        <p
          className="anim-rise mt-2 max-w-xl text-[0.9375rem] text-smoke"
          style={{ ['--d' as string]: '130ms' }}
        >
          {description}
        </p>
      )}
    </div>

    {actions && (
      <div className="anim-rise flex flex-none items-center gap-2" style={{ ['--d' as string]: '180ms' }}>
        {actions}
      </div>
    )}
  </header>
);
