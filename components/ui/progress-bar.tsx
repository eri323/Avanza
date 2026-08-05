const TONES = {
  gradient: 'bg-brand-gradient',
  accent: 'bg-accent',
} as const;

/**
 * El carril por defecto (`bg-surface-sunken/60`) es claro y está pensado para
 * vivir sobre `surface`/`surface-elevated`. Dentro de `<Card tone="feature">`
 * —oscura en los dos temas— ese carril brilla contra la tarjeta y el relleno
 * de acento se hunde en él (1.40:1, ilegible). `track="on-feature"` cambia el
 * carril a un barniz claro muy tenue (`bg-on-feature/8`, blanco casi
 * transparente) para que quede visible pero discreto sobre `surface-feature`,
 * y para que el relleno vuelva a distinguirse con contraste de sobra.
 */
const TRACKS = {
  default: 'bg-surface-sunken/60',
  'on-feature': 'bg-on-feature/8',
} as const;

/**
 * La primitiva no calcula nada: recibe el porcentaje ya derivado (de `lib/xp.ts`
 * o de un conteo) y sólo lo recorta para que un dato raro no desborde la barra.
 */
export function ProgressBar({
  percent,
  label,
  tone = 'gradient',
  track = 'default',
  size = 'md',
}: {
  percent: number;
  label: string;
  tone?: keyof typeof TONES;
  track?: keyof typeof TRACKS;
  size?: 'sm' | 'md';
}) {
  // Un `percent` no finito (NaN de una razón 0/0, o ±Infinity) se trata como 0:
  // así evitamos `width: 'NaN%'` (descartado por el navegador) y un `aria-valuenow` inválido.
  const safePercent = Number.isFinite(percent) ? percent : 0;
  const clamped = Math.max(0, Math.min(100, Math.round(safePercent)));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full overflow-hidden rounded-xl ${TRACKS[track]} ${
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
