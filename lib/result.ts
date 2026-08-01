export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok(): ActionResult<void>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | void> {
  return { ok: true, data: data as T };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

/**
 * Traduce códigos de error de Postgres a mensajes en español.
 *
 * Se enruta por código y nunca por el texto del error: el texto cambia entre
 * versiones y locales, el código no. Los códigos 22007 y 22023 los emiten
 * nuestros propios triggers (fecha futura y zona horaria inválida).
 */
const DB_ERROR_MESSAGES: Record<string, string> = {
  '23505': 'Ese día ya estaba marcado.',
  '23503': 'Ese elemento ya no existe.',
  '23514': 'Los datos no cumplen las reglas del hábito.',
  '22007': 'No puedes marcar un hábito en una fecha futura.',
  '22023': 'Esa zona horaria no existe.',
  '42501': 'No tienes permiso para hacer eso.',
};

export function messageForDbError(code: string | undefined): string {
  if (code && code in DB_ERROR_MESSAGES) return DB_ERROR_MESSAGES[code];
  return 'Algo salió mal. Intenta de nuevo.';
}
