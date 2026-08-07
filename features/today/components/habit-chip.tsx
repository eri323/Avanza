'use client';

export function HabitChip({
  name,
  icon,
  color,
  done,
  streak,
  onToggle,
  disabled,
}: {
  name: string;
  icon: string | null;
  /** Color literal del hábito, elegido por el usuario. */
  color: string;
  done: boolean;
  streak: number;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={`Marcar ${name} hoy`}
      disabled={disabled}
      onClick={onToggle}
      className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all disabled:opacity-40 ${
        done
          ? 'border-transparent text-white'
          : 'border-border bg-surface-elevated text-text-soft hover:border-accent/90'
      }`}
      style={done ? { backgroundColor: color } : undefined}
    >
      <span aria-hidden className="text-body leading-none">
        {icon ?? '•'}
      </span>
      <span className="text-label">{name}</span>
      {streak > 0 && (
        <span
          className={`text-caption ${done ? 'text-white/80' : 'text-text-muted'}`}
        >
          {streak}
        </span>
      )}
    </button>
  );
}
