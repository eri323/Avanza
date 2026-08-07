type ChipTone = 'neutral' | 'accent';

const SELECTED: Record<ChipTone, string> = {
  neutral: 'bg-text text-surface border-transparent',
  // `bg-accent` (#8B5CF6) da 4.23:1 con texto blanco — bajo AA (4.5:1) para
  // `text-label`, que es 13px. No hay token que subir sin oscurecer el acento
  // en toda la app (botones, iconos, FAB), así que el arreglo queda aquí:
  // #7C3AED es el mismo violeta de marca un escalón más oscuro (5.70:1),
  // usado sólo en este estado concreto. Auditoría de la Tarea 33.
  accent: 'bg-[#7C3AED] text-white border-transparent',
};

// `hover:border-accent/90`, no `/40`: contra el `--pulso-border` re-derivado
// (Tarea 33) el `/40` compone a un violeta pálido que da menos contraste que
// el borde en reposo (el hover se veía MENOS visible, no más). `/90` supera
// el contraste propio del borde en reposo en los dos temas.
const IDLE = 'bg-surface-elevated text-text-soft border-border hover:border-accent/90';

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
