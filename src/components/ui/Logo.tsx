
import { Scissors } from 'lucide-react';

/** A marca agora usa um design mais moderno com ícone de tesoura. */
export const Logo = ({
  tone = 'dark',
  suffix,
  className = '',
}: {
  tone?: 'dark' | 'light';
  suffix?: string;
  className?: string;
}) => (
  <span className={`group inline-flex items-center gap-2.5 ${className}`}>
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-[10px] overflow-hidden ${
        tone === 'dark' ? 'bg-pine' : 'bg-white'
      } shadow-card transition-transform group-hover:scale-105`}
    >
      <img 
        src="/logo.png" 
        alt="CutFlow Logo" 
        className="h-full w-full object-cover scale-[1.35]" 
      />
    </div>
    <span className="flex items-baseline gap-1.5">
      <span
        className={`type-sign text-[1.35rem] tracking-tight ${
          tone === 'dark' ? 'text-ink' : 'text-white'
        }`}
      >
        CutFlow
      </span>
      {suffix && (
        <span
          className={`type-tag font-semibold ${
            tone === 'dark' ? 'text-brass-deep' : 'text-brass-bright'
          }`}
        >
          {suffix}
        </span>
      )}
    </span>
  </span>
);
