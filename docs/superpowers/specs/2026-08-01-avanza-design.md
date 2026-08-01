# Avanza — Diseño

**Fecha:** 2026-08-01
**Estado:** aprobado

## Propósito

Avanza es un gestor personal de tareas y hábitos. Tiene dos objetivos que se
sirven mutuamente: que el autor lo use a diario de verdad, y que funcione como
pieza de portafolio con un enlace vivo que cualquiera pueda probar creando su
propia cuenta.

Que sea de uso propio es una restricción de diseño, no una excusa: si una
función no se usa el primer día, no entra. Que sea portafolio implica que la
calidad visible —autenticación real, aislamiento de datos, tipado estricto,
pruebas— importa tanto como las funcionalidades.

## Alcance

**Dentro de v1:** autenticación, tareas con proyectos y fechas, hábitos con
cadencia diaria o semanal, rachas, y una vista Hoy que unifica ambos mundos.

**Fuera de v1, a propósito:** subtareas, etiquetas, recordatorios push,
adjuntos, drag & drop, colaboración, escritura sin conexión y OAuth con Google
—con magic link y contraseña ya hay dos formas de entrar; una tercera sólo
añade configuración en la consola de Google sin resolver nada nuevo.

**Módulo de finanzas:** aplazado a una fase posterior. El esquema actual lo
admite como conjunto de tablas paralelo; no obliga a modificar nada de lo ya
construido.

## Decisiones de arquitectura

### Tareas y hábitos son modelos separados con una vista unificada

Una tarea se completa una vez y desaparece del flujo; un hábito genera un
registro por día y nunca termina. Fusionarlos en un solo modelo de "tarea
recurrente" parece más simple al principio, pero convierte el cálculo de
rachas, el heatmap y la cadencia semanal en consultas incómodas sobre
instancias generadas, y arrastra columnas que sólo aplican a la mitad de las
filas.

Se mantienen como tablas distintas. La vista Hoy consulta ambas y las presenta
en una sola pantalla. El costo aceptado es tener dos flujos de creación en la
interfaz.

### Stack

Next.js (App Router) con TypeScript, Tailwind y shadcn/ui. Supabase para Auth y
Postgres. Despliegue en Vercel.

Un solo repositorio, sin backend separado. Las lecturas ocurren en Server
Components con el cliente de servidor de Supabase; las escrituras pasan por
Server Actions. El resultado es que la llave de servicio nunca llega al
navegador y las mutaciones tienen un único punto de entrada donde validar.

### La seguridad vive en la base de datos

Cada tabla tiene Row Level Security con la regla `user_id = auth.uid()`. La app
es de un solo usuario real, pero el aislamiento por fila es lo que permite que
un visitante del portafolio se registre y juegue con sus propios datos sin ver
los ajenos.

Las llaves foráneas hacia `projects` y `habits` son **compuestas**: incluyen
`user_id`. Así la imposibilidad de referenciar el proyecto de otro usuario la
garantiza el motor, no la capa de aplicación. Importa porque el rol
`service_role` ignora RLS: cualquier cron o webhook futuro sigue protegido.

### La lógica con reglas vive en funciones puras

El cálculo de rachas, la determinación de qué día es "hoy" según la zona
horaria del usuario y la agrupación de tareas en Hoy / Próximos / Sin fecha son
funciones puras en `lib/`, sin dependencia de Supabase. Se prueban en
milisegundos y evitan que la regla de negocio se disuelva entre componentes.

### PWA sin escritura sin conexión

Manifest y service worker para que la app sea instalable y su cáscara cargue
sin red. La cola de sincronización de escrituras offline queda fuera de v1: es
donde más tiempo se invierte y menos se percibe. Sin conexión, la app lo indica
y no permite marcar.

## Modelo de datos

Aplicado en Supabase (proyecto `Avanza`, `nozxsibtojorqhloxgxq`).

```
profiles       id → auth.users, display_name, timezone
projects       id, user_id, name, color, position, archived_at
tasks          id, user_id, project_id?, title, notes?, due_date?,
               priority, position, completed_at
habits         id, user_id, name, color, cadence, target_per_week?,
               position, archived_at
habit_entries  id, habit_id, user_id, entry_date
```

Puntos que no se leen del esquema a simple vista:

**La racha no se almacena.** `habit_entries` es un log append-only con
`unique (habit_id, entry_date)`. Marcar dos veces el mismo día es idempotente;
desmarcar es un `DELETE`. Por eso la tabla no tiene política de `UPDATE`.
Guardar la racha como columna es la causa habitual de rachas que mienten
después de editar una fecha pasada.

**La zona horaria es del perfil y se valida.** "Hoy" es una pregunta más
delicada de lo que parece: con timestamps en UTC, un hábito marcado a las 11 de
la noche cae en el día siguiente. `entry_date` es un `DATE` calculado en la zona
del usuario, y un trigger valida el valor contra `pg_timezone_names` porque una
zona inválida no falla de inmediato: corrompe en silencio todo lo que depende
de qué día es hoy.

**Borrar un proyecto no borra sus tareas.** La FK usa
`ON DELETE SET NULL (project_id)` —sintaxis de PostgreSQL 15+— para anular sólo
esa columna y dejar la tarea viva en la bandeja de entrada.

**No se puede marcar el futuro.** Validado por trigger y no por `CHECK`, porque
PostgreSQL sólo admite funciones inmutables en un `CHECK` y `now()` es `STABLE`.
Tolera un día de holgura sobre UTC para zonas adelantadas.

Los scripts están en `migrations/`, excluida del repositorio por decisión
explícita del autor; `migrations/README.md` documenta las decisiones ya que no
habrá historial de commits que las explique.

## Pantallas

| Ruta | Contenido |
|------|-----------|
| `/login` | Magic link por email y acceso con contraseña |
| `/hoy` | Hábitos del día y tareas vencidas o de hoy, con captura rápida |
| `/tareas` | Pendientes agrupadas en Hoy / Próximos / Sin fecha, filtro por proyecto |
| `/proyectos/[id]` | Tareas del proyecto y su progreso |
| `/habitos` | Racha actual y heatmap de las últimas 12 semanas |
| `/ajustes` | Zona horaria, tema, cerrar sesión |

`/hoy` es la ruta raíz tras iniciar sesión: es la pantalla que justifica la app.

## Organización del código

```
app/                    rutas y layouts
features/tasks/         consultas, acciones y componentes de tareas
features/habits/        consultas, acciones y componentes de hábitos
features/today/         compone tareas y hábitos; no tiene modelo propio
lib/supabase/           clientes de navegador y servidor
lib/streaks.ts          cálculo de rachas — puro
lib/dates.ts            "hoy" según zona horaria, agrupación — puro
lib/validation.ts       esquemas Zod compartidos entre formulario y acción
```

Cada carpeta de `features/` expone consultas y acciones por su índice; los
componentes de otra feature no importan sus internos. `features/today/` es
deliberadamente un compositor sin modelo propio, para que la vista unificada no
se convierta en un tercer lugar donde vivan reglas de tareas o de hábitos.

## Manejo de errores

Las Server Actions devuelven un resultado tipado (`{ ok }` o `{ error }`), no
lanzan excepciones hacia la interfaz. Los formularios validan con Zod usando el
mismo esquema en cliente y servidor, de modo que la validación del cliente sea
una comodidad y no la única defensa.

Marcar una tarea o un hábito usa actualización optimista con reversión si la
escritura falla: es la interacción más frecuente de la app y esperar al
servidor la haría sentir lenta.

Los errores esperados de la base —día duplicado, fecha futura— se traducen a
mensajes en español por código de error, no por texto.

## Pruebas

Vitest para la lógica pura, que es donde están las reglas reales: rachas
diarias y semanales, huecos, cambios de zona horaria y agrupación por fecha.
Estos casos no necesitan base de datos y deben correr en segundos.

Playwright para tres recorridos completos: registrarse y llegar a Hoy; crear una
tarea, completarla y verla salir de la lista; marcar un hábito y ver la racha
subir a uno.

El aislamiento entre usuarios se verifica en producción registrando una segunda
cuenta en una ventana de incógnito y confirmando que no ve los datos de la
primera. El esquema ya pasó una batería de diez aserciones funcionales al
aplicarse, que cubren la integridad entre usuarios a nivel de motor.

## Criterios de éxito

1. El autor registra tareas y marca hábitos a diario sin volver a otra app.
2. Un visitante crea su cuenta desde el enlace público y prueba la app con sus
   propios datos, sin ver los de nadie más.
3. La vista Hoy carga en menos de un segundo en móvil.
4. Añadir el módulo de finanzas no obliga a modificar el esquema existente.
