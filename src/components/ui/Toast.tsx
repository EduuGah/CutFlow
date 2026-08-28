import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { usePresence } from '../../hooks/usePresence';

type Kind = 'success' | 'error' | 'info';

interface ToastRecord {
  id: number;
  kind: Kind;
  message: string;
  open: boolean;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const LIFETIME = 4200;

const SKIN: Record<Kind, { icon: typeof Check; ring: string; bar: string }> = {
  success: { icon: Check, ring: 'bg-verdigris', bar: 'bg-verdigris' },
  error: { icon: AlertTriangle, ring: 'bg-oxblood', bar: 'bg-oxblood' },
  info: { icon: Info, ring: 'bg-brass', bar: 'bg-brass' },
};

const ToastRow = ({ toast, onDismiss }: { toast: ToastRecord; onDismiss: (id: number) => void }) => {
  const { mounted, state } = usePresence(toast.open, 340);
  const skin = SKIN[toast.kind];
  const Icon = skin.icon;

  if (!mounted) return null;

  return (
    <div
      className="toast-item pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border border-white/10 bg-pine-deep p-3.5 pr-2.5 text-white shadow-pop sm:w-80"
      data-state={state}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full ${skin.ring}`}
      >
        <Icon className="h-3.5 w-3.5 text-white" strokeWidth={3} />
      </span>

      <p className="flex-1 pt-0.5 text-sm leading-snug text-white/90">{toast.message}</p>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="icon-btn h-7 w-7 flex-none text-white/45 hover:bg-white/10 hover:text-white"
        aria-label="Dispensar aviso"
      >
        <X className="h-4 w-4" />
      </button>

      <span
        className={`absolute bottom-0 left-0 h-0.5 origin-left ${skin.bar}`}
        style={{
          width: '100%',
          animation: `cf-drain ${LIFETIME}ms linear forwards`,
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.map((t) => (t.id === id ? { ...t, open: false } : t)));
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 360);
  }, []);

  const push = useCallback(
    (kind: Kind, message: string) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, kind, message, open: true }]);
      window.setTimeout(() => dismiss(id), LIFETIME);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 pb-safe sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
            role="status"
            aria-live="polite"
          >
            {toasts.map((toast) => (
              <div key={toast.id} className="relative w-full sm:w-auto">
                <ToastRow toast={toast} onDismiss={dismiss} />
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

/** Sem provider (por exemplo, em teste isolado), os avisos viram no-op. */
const NOOP: ToastApi = { success: () => {}, error: () => {}, info: () => {} };

export const useToast = (): ToastApi => useContext(ToastContext) ?? NOOP;
