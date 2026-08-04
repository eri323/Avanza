type ChipTone = 'neutral' | 'accent';

const SELECTED: Record<ChipTone, string> = {
  neutral: 'bg-text text-surface border-transparent',
  accent: 'bg-accent text-white border-transparent',
};

const IDLE = 'bg-surface-elevated text-text-soft border-border hover:border-accent/40';

export function Chip({
  selected = false,
  tone = 'accent',
  dot,
  as: Tag = 'span',
  type,
  className = '',
  children,
  ...props
}: {
  selected?: boolean;
  tone?: ChipTone;
  /** Color literal del proyecto o del hábito: es dato del usuario, no un token. */
  dot?: string;
  as?: 'button' | 'span';
  /** Sólo tiene sentido con `as="button"`, y ahí es obligatorio: un <button>
   *  sin type dentro de un <form> envía el formulario. */
  type?: 'button';
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      type={type}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-label transition-colors ${
        selected ? SELECTED[tone] : IDLE
      } ${className}`}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className="size-2 rounded-xl"
          style={{ backgroundColor: dot }}
        />
      )}
      {children}
    </Tag>
  );
}
