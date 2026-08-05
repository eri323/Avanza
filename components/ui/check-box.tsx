/**
 * No es un <input type="checkbox">: el prototipo pide un relleno de color
 * propio del hábito y un check dibujado, y estilar el control nativo hasta ahí
 * es más frágil que un botón con role="checkbox".
 */
export function CheckBox({
  checked,
  onToggle,
  label,
  disabled = false,
  color,
  shape = 'square',
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
  /** Color literal del hábito. Si falta, usa el acento. */
  color?: string;
  shape?: 'square' | 'circle';
}) {
  const fill = color ?? '#8B5CF6';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      // El cuadro visual se queda en 24px (WCAG 2.5.8 pide 24px como mínimo
      // literal), pero el objetivo táctil recomendado son 44px. `before:` añade
      // un área de impacto invisible de 44px (24 + 10px por lado) sin tocar el
      // tamaño ni la posición del cuadro: al ser absoluto no participa en el
      // flujo, así que no desplaza vecinos en filas con `gap-3`.
      className={`relative grid size-6 shrink-0 place-items-center border-2 transition-all before:absolute before:-inset-2.5 before:content-[''] disabled:opacity-40 ${
        shape === 'circle' ? 'rounded-xl' : 'rounded-xs'
      }`}
      style={{
        borderColor: fill,
        backgroundColor: checked ? fill : 'transparent',
      }}
    >
      {checked && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="size-4"
        >
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
      )}
    </button>
  );
}
