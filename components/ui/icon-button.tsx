type IconButtonTone = 'plain' | 'ghost' | 'danger';

const TONES: Record<IconButtonTone, string> = {
  // `/90`, no `/40`: contra el `--pulso-border` re-derivado (Tarea 33) el
  // `/40` da menos contraste que el borde en reposo. Tarea 33 (cierre).
  plain: 'bg-surface-elevated border-border text-text-soft hover:border-accent/90',
  ghost: 'bg-transparent border-transparent text-text-soft hover:bg-surface-sunken',
  // `text-accent-warm` (#FF5E7E, icono sobre `surface-elevated`) da 2.94:1 en
  // tema claro — bajo el umbral de 3.0:1 de WCAG 1.4.11 para un icono de
  // control interactivo. No hay token que oscurecer sin afectar rellenos y
  // gradientes en el resto de la app; #E63B60 es el mismo cálido un escalón
  // más oscuro (4.07:1 claro / 4.11:1 oscuro), sólo en este botón. Tarea 33.
  danger: 'bg-transparent border-transparent text-[#E63B60] hover:bg-accent-warm/10',
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
