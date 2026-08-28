import React from 'react';
import { Pole } from './Pole';

type Variant = 'primary' | 'brass' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'btn-primary',
  brass: 'btn-brass',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const SIZE: Record<Size, string> = { sm: 'btn-sm', md: '', lg: 'btn-lg' };

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Texto exibido enquanto carrega. Sem ele, o rótulo original permanece. */
  loadingLabel?: string;
  block?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel,
  block = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) => (
  <button
    className={`btn ${VARIANT[variant]} ${SIZE[size]} ${block ? 'w-full' : ''} ${className}`}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...rest}
  >
    {loading && (
      <Pole size="xs" tone={variant === 'primary' || variant === 'danger' ? 'onDark' : 'brand'} />
    )}
    <span className="inline-flex items-center gap-2">
      {loading && loadingLabel ? loadingLabel : children}
    </span>
  </button>
);
