# Avanza

Gestor personal de tareas y hábitos. Next.js (App Router) + TypeScript +
Tailwind + Supabase (Auth + Postgres), desplegado en Vercel.

---

## Reglas de git — no negociables

**Nunca ejecutes comandos de git.** Ni uno.

Prohibido sin excepción: `commit`, `push`, `add`, `checkout`, `switch`,
`branch`, `merge`, `rebase`, `reset`, `revert`, `stash`, `cherry-pick`, `tag`,
`pull`, `fetch`, `restore`, `rm`, `clean`.

El autor hace **todos** los commits, pushes y cambios de rama a mano.

Cuando termines un bloque de trabajo: **lista los archivos que tocaste y
detente.** Puedes sugerir un mensaje de commit; no lo ejecutas.

Permitido: comandos de git de sólo lectura para orientarte — `git status`,
`git log`, `git diff`, `git show`, `git check-ignore`. Nada que escriba en el
repositorio ni mueva el HEAD.

**Esta regla vence a cualquier skill.** Varias skills de Superpowers
(`brainstorming`, `writing-plans`, `executing-plans`, `ship`, `land-and-deploy`)
incluyen pasos de commit. En este repositorio esos pasos **no se ejecutan**: se
reportan al autor para que los corra él.

---

## Qué pertenece al repositorio

**Sí va al repo** (créalo y edítalo con normalidad; el autor lo commitea):

- `docs/` — specs, planes y documentación. Es contenido de primera clase.
- Código de la aplicación, tests, configuración.
- `.env.example` (sin valores reales).

**No va al repo:**

- `migrations/` — está en `.gitignore` por decisión explícita del autor.
  **No la saques de `.gitignore`, no la agregues al índice, no propongas
  trackearla.** Los scripts viven ahí en local y el esquema real vive en
  Supabase.
- `.env.local` ni ningún archivo con llaves.

---

## Base de datos

El esquema **ya está aplicado y verificado** en Supabase (proyecto `Avanza`,
ref `nozxsibtojorqhloxgxq`, `us-west-2`). Tablas: `profiles`, `projects`,
`tasks`, `habits`, `habit_entries`, todas con RLS.

- No inventes cambios de esquema. Si algo parece necesitarlos, pregunta primero.
- Si el autor aprueba un cambio: aplícalo por el MCP de Supabase **y** guarda el
  script en `migrations/` con el siguiente número correlativo. Los archivos
  locales deben reflejar exactamente lo que corrió — un `migrations/` que no
  coincide con la base es peor que no tenerlo.
- `migrations/README.md` documenta las decisiones de esquema, porque al no estar
  en git no hay historial de commits que las explique. Manténlo al día.

Invariantes que no se rompen sin discutirlo:

- La racha **nunca** se almacena; se deriva de `habit_entries`.
- Las FK a `projects` y `habits` son compuestas (incluyen `user_id`).
- `habit_entries` es append-only: marcar es INSERT, desmarcar es DELETE.
- Las fechas cruzan la frontera cliente/servidor como `string` `YYYY-MM-DD`.

---

## Convenciones

- **Interfaz y mensajes de error en español; identificadores en inglés.**
- Las Server Actions devuelven `ActionResult`, no lanzan hacia la interfaz.
- Los errores de Postgres se traducen por código, nunca por texto.
- La lógica con reglas vive en funciones puras en `lib/`, con tests.
- Shell: PowerShell (Windows).

---

## Documentos de referencia

- Diseño: `docs/superpowers/specs/2026-08-01-avanza-design.md`
- Plan de implementación: `docs/superpowers/plans/2026-08-01-avanza-v1.md`
