/**
 * Fechas de calendario como texto ISO 'YYYY-MM-DD'.
 *
 * Todo se representa como string y no como Date por dos razones: las
 * comparaciones lexicográficas de ISO ya ordenan correctamente, y un Date
 * arrastra una hora que invita a errores de zona horaria en cada frontera
 * cliente/servidor.
 */
export type IsoDate = string;

/** Mediodía UTC: lo bastante lejos de ambos bordes del día para que ningún
 *  cambio de horario de verano (±1h) empuje la fecha al día vecino. */
function atUtcNoon(date: IsoDate): Date {
  return new Date(`${date}T12:00:00Z`);
}

/**
 * Qué día es "hoy" para un usuario en `timezone`.
 *
 * El locale 'en-CA' formatea como 'YYYY-MM-DD', lo que evita traer una
 * librería de fechas sólo para esto.
 */
export function todayIn(timezone: string, now: Date = new Date()): IsoDate {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/**
 * Hora local del usuario, 0–23. `hourCycle: 'h23'` es lo que evita que
 * medianoche llegue como 24, que es lo que devuelve el ciclo por defecto en
 * varios locales.
 */
export function hourIn(timezone: string, now: Date = new Date()): number {
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(now);

  return Number(formatted);
}

/**
 * "2 de julio". Sin año porque sólo se usa para fechas cercanas, donde el año
 * es ruido.
 *
 * `timeZone: 'UTC'` es obligatorio: la fecha ya viene resuelta al día del
 * usuario y formatearla en la zona del servidor la correría un día en Vercel.
 */
export function formatDayMonth(date: IsoDate): string {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const d = atUtcNoon(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function diffInDays(from: IsoDate, to: IsoDate): number {
  const ms = atUtcNoon(to).getTime() - atUtcNoon(from).getTime();
  return Math.round(ms / 86_400_000);
}

/** Lunes de la semana a la que pertenece `date` (semana ISO). */
export function isoWeekStart(date: IsoDate): IsoDate {
  const dayOfWeek = (atUtcNoon(date).getUTCDay() + 6) % 7; // lunes = 0
  return addDays(date, -dayOfWeek);
}

export type TaskBucket = 'overdue' | 'today' | 'upcoming' | 'someday';

export function bucketFor(dueDate: IsoDate | null, today: IsoDate): TaskBucket {
  if (dueDate === null) return 'someday';
  if (dueDate < today) return 'overdue';
  if (dueDate === today) return 'today';
  return 'upcoming';
}
