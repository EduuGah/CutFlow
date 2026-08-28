
/** A marca é o próprio poste: hélice parada, que gira ao passar o mouse. */
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
    <span
      className="pole h-7 w-7 flex-none rounded-lg"
      style={{ ['--pole-a' as string]: '#e6bc68', ['--pole-b' as string]: '#14392e' }}
      aria-hidden="true"
    >
      <span className="pole-stripes pole-stripes-hover absolute inset-0" />
    </span>
    <span className="flex items-baseline gap-1.5">
      <span
        className={`type-sign text-[1.35rem] ${tone === 'dark' ? 'text-ink' : 'text-white'}`}
      >
        CutFlow
      </span>
      {suffix && (
        <span
          className={`type-tag ${tone === 'dark' ? 'text-brass-deep' : 'text-brass-bright'}`}
        >
          {suffix}
        </span>
      )}
    </span>
  </span>
);
