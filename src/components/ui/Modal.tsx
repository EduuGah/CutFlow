import React, { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { usePresence } from '../../hooks/usePresence';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  children: (state: 'open' | 'closed') => React.ReactNode;
  labelledBy: string;
  align: 'center' | 'right';
  panelClassName?: string;
}

/** Base compartilhada: portal, trava de rolagem, ESC, foco preso e retorno de foco. */
const Overlay = ({ open, onClose, children, labelledBy, align, panelClassName = '' }: OverlayProps) => {
  const { mounted, state } = usePresence(open, 360);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!mounted) return;

    restoreRef.current = document.activeElement as HTMLElement | null;

    const { body, documentElement } = document;
    const gutter = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    const focusTimer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (target ?? panelRef.current)?.focus();
    }, 60);

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      window.clearTimeout(focusTimer);
      restoreRef.current?.focus?.();
    };
  }, [mounted]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex ${
        align === 'center' ? 'items-end justify-center p-0 sm:items-center sm:p-4' : 'justify-end'
      }`}
      onKeyDown={handleKeyDown}
    >
      <div className="scrim" data-state={state} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`${
          align === 'center'
            ? 'dialog relative z-10 w-full max-w-md'
            : 'drawer relative z-10 h-full w-full'
        } outline-none ${panelClassName}`}
        data-state={state}
      >
        {children(state)}
      </div>
    </div>,
    document.body
  );
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/** Diálogo centralizado no desktop, folha inferior no celular. */
export const Modal = ({ open, onClose, title, description, children }: ModalProps) => {
  const titleId = useId();

  return (
    <Overlay open={open} onClose={onClose} labelledBy={titleId} align="center">
      {() => (
        <div className="max-h-[92vh] overflow-y-auto rounded-t-2xl border border-line bg-porcelain shadow-pop sm:rounded-2xl">
          <header className="flex items-start justify-between gap-4 border-b border-line-soft px-6 py-5">
            <div>
              <h2 id={titleId} className="type-sign text-xl text-ink">
                {title}
              </h2>
              {description && <p className="mt-1.5 text-sm text-smoke">{description}</p>}
            </div>
            <button type="button" onClick={onClose} className="icon-btn -mr-2" aria-label="Fechar">
              <X className="h-5 w-5" />
            </button>
          </header>
          {children}
        </div>
      )}
    </Overlay>
  );
};

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

/** Painel lateral para edição longa (serviços, horários da equipe). */
export const Drawer = ({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
  width = 'max-w-md',
}: DrawerProps) => {
  const titleId = useId();

  return (
    <Overlay
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      align="right"
      panelClassName={width}
    >
      {() => (
        <div className="flex h-full w-full flex-col border-l border-line bg-porcelain shadow-pop">
          <header className="flex items-start justify-between gap-4 border-b border-line-soft px-6 py-5">
            <div>
              <h2 id={titleId} className="type-sign text-xl text-ink">
                {title}
              </h2>
              {subtitle && <p className="mt-1.5 text-sm text-smoke">{subtitle}</p>}
            </div>
            <button type="button" onClick={onClose} className="icon-btn -mr-2" aria-label="Fechar">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

          {footer && (
            <footer className="flex gap-3 border-t border-line-soft bg-chalk/60 px-6 py-4 pb-safe">
              {footer}
            </footer>
          )}
        </div>
      )}
    </Overlay>
  );
};
