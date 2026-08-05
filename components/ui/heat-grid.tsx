export type HeatCell = {
  key: string;
  /** 0 vacío · 1 cumplido · 2 fuera de rango (futuro) */
  level: 0 | 1 | 2;
  label: string;
};

export type HeatColumn = HeatCell[];

/**
 * Pinta una rejilla de intensidades. No conoce el dominio: quien la usa le pasa
 * las columnas ya construidas por una función pura con tests. Es lo que permite
 * que los bloques 2 a 5 la reutilicen sin tocarla.
 */
export function HeatGrid({
  columns,
  color,
  caption,
}: {
  columns: HeatColumn[];
  /** Color literal del hábito. */
  color: string;
  caption: string;
}) {
  return (
    <div className="flex gap-1" role="group" aria-label={caption}>
      {columns.map((column, index) => (
        <div key={index} className="flex flex-col gap-1">
          {column.map((cell) => (
            <span
              key={cell.key}
              title={cell.label}
              className="size-3 rounded-[3px] bg-surface-sunken"
              style={
                cell.level === 1
                  ? { backgroundColor: color }
                  : cell.level === 2
                    ? { opacity: 0.35 }
                    : undefined
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}
