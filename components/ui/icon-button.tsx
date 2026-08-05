type IconButtonTone = 'plain' | 'ghost' | 'danger';

const TONES: Record<IconButtonTone, string> = {
  plain: 'bg-surface-elevated border-border text-text-soft hover:border-accent/40',
  ghost: 'bg-transparent border-transparent text-text-soft hover:bg-surface-sunken',
  danger: 'bg-transparent border-transparent text-accent-warm hover:bg-accent-warm/10',
};

export function IconButton({
  label,
  tone = 'plain',
  type = 'button',
  className = '',
  children,
  ...props
}: {
  label: string;
  tone?: IconButtonTone;
  type?: 'button' | 'submit';
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'aria-label' | 'title'>) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`grid size-11 shrink-0 place-items-center rounded-md border transition-colors disabled:opacity-40 ${TONES[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
