import React from 'react';

/**
 * O poste da barbearia é a assinatura do produto: toda espera usa a mesma
 * hélice a 45°. Aqui ele aparece em três formatos — cápsula (espera pontual),
 * barra (progresso de página) e trilho (progresso do fluxo de agendamento).
 */

type Tone = 'brand' | 'onDark' | 'brass';

const TONES: Record<Tone, React.CSSProperties> = {
  brand: { ['--pole-a' as string]: '#bd8a2c', ['--pole-b' as string]: '#14392e' },
  onDark: { ['--pole-a' as string]: '#e6bc68', ['--pole-b' as string]: '#0f2a22' },
  brass: { ['--pole-a' as string]: '#f7edd9', ['--pole-b' as string]: '#bd8a2c' },
};

const SIZES = {
  xs: 'w-2 h-4',
  sm: 'w-2.5 h-6',
  md: 'w-3.5 h-9',
  lg: 'w-6 h-20',
} as const;

interface PoleProps {
  size?: keyof typeof SIZES;
  tone?: Tone;
  spinning?: boolean;
  className?: string;
  label?: string;
}

export const Pole = ({
  size = 'sm',
  tone = 'brand',
  spinning = true,
  className = '',
  label,
}: PoleProps) => (
  <span
    className={`pole ${SIZES[size]} ${className}`}
    style={TONES[tone]}
    role={label ? 'status' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
  >
    <span
      className={`absolute inset-0 pole-stripes ${spinning ? '' : 'pole-stripes-still'}`}
    />
  </span>
);

/** Barra fina de progresso — usada no topo durante troca de rota. */
export const PoleBar = ({
  tone = 'brand',
  className = '',
}: {
  tone?: Tone;
  className?: string;
}) => (
  <span
    className={`block h-full w-full pole-stripes ${className}`}
    style={TONES[tone]}
    aria-hidden="true"
  />
);

/**
 * Trilho vertical do fluxo de agendamento: a parte concluída é hélice viva,
 * o resto fica apagado. Substitui a numeração solta por um progresso legível.
 */
export const PoleRail = ({ progress }: { progress: number }) => (
  <div
    className="relative w-1.5 overflow-hidden rounded-full bg-line"
    aria-hidden="true"
  >
    <div
      className="absolute inset-x-0 top-0 pole-stripes rounded-full transition-[height] duration-700 ease-out"
      style={{ ...TONES.brand, height: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);
