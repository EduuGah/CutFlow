import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../ui/Logo';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  /** Frase da coluna escura — fala do produto, não do formulário. */
  asideTitle: string;
  asideBody: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * Fachada: coluna escura com a marca, coluna clara com o formulário.
 * No celular a fachada vira uma faixa fina no topo.
 */
export const AuthShell = ({
  eyebrow,
  title,
  description,
  asideTitle,
  asideBody,
  children,
  footer,
}: AuthShellProps) => (
  <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
    {/* Fachada */}
    <aside className="relative overflow-hidden bg-pine-deep px-5 py-6 text-white sm:px-8 lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: 'radial-gradient(70% 50% at 20% 0%, rgba(189,138,44,0.2), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between">
        <Link to="/" aria-label="CutFlow, início">
          <Logo tone="light" />
        </Link>
        <Link
          to="/"
          className="link-underline hidden items-center gap-2 text-sm text-white/55 transition-colors hover:text-white lg:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" />
          Início
        </Link>
      </div>

      <div className="relative hidden lg:block">
        <h2 className="type-display max-w-md text-[3rem] leading-[0.95]">{asideTitle}</h2>
        <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-white/55">{asideBody}</p>
      </div>

      <span
        className="pole-stripes pole-stripes-still absolute inset-x-0 bottom-0 h-1 lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-1.5"
        style={{ ['--pole-a' as string]: '#e6bc68', ['--pole-b' as string]: '#0f2a22' }}
        aria-hidden="true"
      />
    </aside>

    {/* Formulário */}
    <main className="flex items-center justify-center px-5 py-12 sm:px-8 lg:py-16">
      <div className="w-full max-w-md">
        <p className="type-tag anim-fade flex items-center gap-2.5 text-brass-deep">
          <span className="h-px w-6 bg-brass/60" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1
          className="type-display anim-rise mt-4 text-[2.4rem] text-ink"
          style={{ ['--d' as string]: '70ms' }}
        >
          {title}
        </h1>
        <p
          className="anim-rise mt-2 text-[0.9375rem] text-smoke"
          style={{ ['--d' as string]: '130ms' }}
        >
          {description}
        </p>

        <div className="anim-rise mt-9" style={{ ['--d' as string]: '190ms' }}>
          {children}
        </div>

        <div
          className="anim-rise mt-8 border-t border-line pt-6 text-sm text-smoke"
          style={{ ['--d' as string]: '260ms' }}
        >
          {footer}
        </div>
      </div>
    </main>
  </div>
);
