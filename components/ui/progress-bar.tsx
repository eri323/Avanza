const TONES = {
  gradient: 'bg-brand-gradient',
  accent: 'bg-accent',
  positive: 'bg-positive',
} as const;

/**
 * La primitiva no calcula nada: recibe el porcentaje ya derivado (de `lib/xp.ts`
 * o de un conteo) y sólo lo recorta para que un dato raro no desborde la barra.
 */
export function ProgressBar({
  percent,
  label,
  tone = 'gradient',
  size = 'md',
}: {
  percent: number;
  label: string;
  tone?: keyof typeof TONES;
  size?: 'sm' | 'md';
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full overflow-hidden rounded-xl bg-surface-sunken/60 ${
        size === 'sm' ? 'h-1.5' : 'h-2.5'
      }`}
    >
      <div
        className={`h-full rounded-xl transition-[width] duration-500 ease-out ${TONES[tone]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
