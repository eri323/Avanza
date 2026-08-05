import { z } from 'zod';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

/** Forma de un UUID (8-4-4-4-12 hex, sin distinguir mayúsculas), sin exigir
 *  versión ni variante concretas: Postgres acepta cualquier UUID válido y esta
 *  guarda no debe ser más estricta que la base. */
export const UUID_SHAPE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Un input de tipo date vacío llega como '', no como undefined. */
const optionalIsoDate = z
  .string()
  .trim()
  .regex(ISO_DATE, 'Usa el formato AAAA-MM-DD')
  .nullable()
  .optional()
  .or(z.literal('').transform(() => null))
  .transform((value) => value ?? null);

const title = z
  .string()
  .trim()
  .min(1, 'El título no puede estar vacío')
  .max(200, 'El título no puede pasar de 200 caracteres');

const name = z
  .string()
  .trim()
  .min(1, 'El nombre no puede estar vacío')
  .max(80, 'El nombre no puede pasar de 80 caracteres');

const color = z.string().regex(HEX_COLOR, 'El color debe ser hexadecimal');

/** Un emoji compuesto (bandera, familia, tono de piel) puede ocupar varios
 *  puntos de código; 8 caracteres cubren los que existen sin dejar meter una
 *  frase en el hueco del icono.
 *
 *  El conteo va por puntos de código y no por `.max()`, que cuenta unidades
 *  UTF-16: la familia 👨‍👩‍👧‍👦 son 11 unidades (4 emojis de 2 más 3 ZWJ) y se
 *  rechazaba justo el caso que este límite dice cubrir. */
const icon = z
  .string()
  .trim()
  .refine(
    (value) => [...value].length <= 8,
    'El emoji no puede pasar de 8 caracteres',
  )
  .nullable()
  .optional()
  .transform((value) => (value ? value : null));

export const createTaskSchema = z.object({
  title,
  notes: z.string().trim().max(5000).nullable().optional().default(null),
  dueDate: optionalIsoDate.default(null),
  projectId: z.string().uuid().nullable().optional().default(null),
  priority: z.enum(['none', 'low', 'medium', 'high']).default('none'),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid(),
});

export const createProjectSchema = z.object({
  name,
  color: color.default('#6366F1'),
});

/**
 * `target_per_week` es obligatorio si y sólo si la cadencia es semanal. La
 * misma regla existe como CHECK en la base; aquí se replica para dar un
 * mensaje en el formulario en lugar de un error 500.
 */
export const createHabitSchema = z
  .object({
    name,
    color: color.default('#22C55E'),
    icon,
    cadence: z.enum(['daily', 'weekly']),
    targetPerWeek: z.coerce.number().int().min(1).max(7).nullable().optional(),
  })
  .refine(
    (value) =>
      value.cadence === 'weekly'
        ? value.targetPerWeek != null
        : value.targetPerWeek == null,
    {
      message:
        'Un hábito semanal necesita una meta de 1 a 7; uno diario no lleva meta.',
      path: ['targetPerWeek'],
    },
  );

export const timezoneSchema = z.string().min(1).max(64);

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
