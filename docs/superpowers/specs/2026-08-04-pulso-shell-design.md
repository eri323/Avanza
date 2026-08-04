# Pulso Shell — Diseño

**Fecha:** 2026-08-04
**Estado:** aprobado
**Reemplaza parcialmente:** `2026-08-01-avanza-design.md` (secciones de pantallas y
organización del código; el modelo de datos y las invariantes siguen vigentes)

## Propósito

Avanza v1 está construida y funciona, pero su interfaz es la del scaffold: Arial,
blanco, navegación superior. Existe un prototipo de diseño terminado —Pulso— que
define un sistema visual completo y una navegación móvil.

Este documento cubre el primer bloque de cinco: reemplazar la piel por el sistema
de Pulso, con dos layouts reales —móvil y escritorio—, sin tocar el modelo de
datos salvo una columna. Al terminar, Avanza se ve y se navega como el prototipo,
y **todo lo que muestra sale de datos reales o se deriva de ellos.**

La app se sigue llamando Avanza. "Pulso" nombra el sistema de diseño, no el
producto.

## Por qué hay cinco bloques

El prototipo no es un rediseño: es otro producto. Trae gamificación con niveles y
logros, replanificación con IA, calendario con agenda por horas, subtareas,
recordatorios con hora y hábitos con meta cuantitativa. Nada de eso existe hoy ni
en el esquema.

Meterlo todo en un spec garantiza que el primer bloque se implemente mal para
acomodar a los otros cuatro. La descomposición acordada, en orden de dependencia:

1. **Pulso Shell** — este documento.
2. **Tareas ricas** — subtareas, hora en la tarea, recordatorios.
3. **Hábitos cuantitativos** — "6/8 vasos", "20 min". Cambia `habit_entries`.
4. **Gamificación persistente** — XP acumulado, logros, retos.
5. **Calendario y agenda** — depende del bloque 2.

Cada bloque tendrá su propio spec y su propio plan.

## Alcance

**Dentro:** sistema de tokens con tema claro y oscuro, tipografía, primitivas de
interfaz, shell responsive con navegación inferior en móvil y barra lateral en
escritorio, las siete pantallas del prototipo, maestro-detalle en escritorio, XP
derivado y nivel derivado, aviso real en la tarjeta destacada de Inicio.

**Fuera, con destino asignado:** subtareas, hora y recordatorios (bloque 2);
hábitos cuantitativos (bloque 3); XP persistente, logros y retos (bloque 4);
calendario y agenda (bloque 5); planificación con IA (sin bloque asignado).

## Sistema visual

### Tokens

Semánticos, no literales. Se declaran una vez en `@theme` con sus dos valores y
los componentes nunca nombran un color directo. Es lo que hace que añadir o
corregir el tema oscuro sea editar un archivo y no cada componente.

| Token | Claro | Oscuro |
|---|---|---|
| `surface` | `#FBF7FF` | `#150C28` |
| `surface-elevated` | `#FFFFFF` | `#221542` |
| `surface-sunken` | `#F0E9FA` | `#2C1E4A` |
| `surface-feature` | `#150C28` | `#221542` |
| `border` | `#F0E9FA` | `#3A2560` |
| `text` | `#1B1130` | `#FFFFFF` |
| `text-soft` | `#5B3E8C` | `#B9A9E0` |
| `text-muted` | `#8B7FA8` | `#8B7FA8` |

Acentos idénticos en ambos temas: `accent` `#8B5CF6`, `accent-warm` `#FF5E7E`,
`accent-amber` `#FF9C5B`, `positive` `#67E8A0`. El gradiente de marca
—`135deg, #8B5CF6 → #FF5E7E`— queda reservado al FAB y al botón de acción
principal de cada pantalla; usarlo en más sitios le quita el significado de "esto
es lo que vas a pulsar".

Radios `8 / 13 / 18 / 22 / 30`. Sombras teñidas de violeta, nunca negras: es lo
que distingue el prototipo de un tema por defecto.

### El tema oscuro ya estaba diseñado

`surface-feature` es la única decisión que el prototipo no traía resuelta. En
claro, la tarjeta de progreso del día y la de racha destacan **por ser oscuras**
sobre lavanda; en oscuro se fundirían con el fondo. Suben a `#221542` con borde
`#3A2560`: jerarquía por elevación en vez de por inversión.

El resto de la escala oscura no se inventó. La pantalla `/progreso` del prototipo
es una app oscura completa, con sus superficies y sus contrastes ya probados
contra los acentos.

### Tipografía

Bricolage Grotesque por `next/font/google`, variable, pesos 400–800. La escala del
prototipo se codifica en `@theme` en vez de repetirse inline en cada elemento.

### Tema claro y oscuro

Clase en `<html>`, persistida en `localStorage`, inicializada por un script inline
para evitar el parpadeo en la primera pintura. Valor inicial:
`prefers-color-scheme`. Toggle en `/perfil`.

No toca `profiles`: el tema es preferencia de dispositivo, no de cuenta. Alguien
que use la PWA en el móvil de noche y en el portátil de día quiere valores
distintos, y una columna en la base se lo impediría.

### Limpieza

Se elimina de `globals.css` el bloque heredado del scaffold: tokens Geist que
ningún componente usa, `font-family: Arial` y el `prefers-color-scheme` que
compite con el sistema nuevo.

**No se instala shadcn/ui**, aunque el spec de v1 lo mencionaba. Son ocho
primitivas muy opinadas; adoptar la librería obligaría a pelear con sus estilos
por defecto en cada una.

## Componentes

```
components/ui/       primitivas: Card, Chip, CheckBox, Sheet, Fab, StatTile,
                     ProgressBar, IconButton, HeatGrid
components/shell/    AppShell, BottomNav, Sidebar
features/*/          los componentes de dominio se reescriben sobre las primitivas
                     y se quedan donde están
```

Cada primitiva hace una cosa, no conoce el dominio y recibe datos ya calculados.
`HeatGrid` pinta una rejilla de intensidades; no sabe qué es un hábito ni cómo se
calcula una racha. Es lo que permite que los bloques 2 a 5 las reutilicen sin
tocarlas.

`AppShell` decide el layout **por CSS**, no detectando el ancho en JavaScript ni
en el servidor: no hay estado que hidratar ni salto visual al cargar.

## Rutas

```
/inicio          antes /hoy — saludo, aviso, progreso del día, chips de
                 hábitos, tareas
/tareas          chips de proyecto + lista
/tareas/[id]     detalle: página completa en móvil, panel derecho en escritorio
/habitos         racha global + tarjetas con la semana en siete puntos
/habitos/[id]    racha, porcentaje del mes, mejor racha, heatmap de cinco
                 semanas, botón de marcar
/progreso        nueva — racha global, barras de la semana, resumen
/perfil          antes /ajustes — avatar, zona horaria, tema, proyectos, salir
/proyectos       gestión, accesible desde Perfil y desde el pie de la barra
                 lateral
/proyectos/[id]  mismo contenido, piel nueva
/login           piel nueva
```

Los cinco destinos de la navegación son **Inicio, Tareas, Hábitos, Progreso y
Perfil**, en ese orden. `/proyectos`, `/proyectos/[id]` y `/login` reciben la piel
nueva aunque no sean destinos ni aparezcan en el prototipo.

`/hoy` y `/ajustes` quedan como redirecciones permanentes: la PWA ya instalada
apunta a `/hoy` y un 404 al abrirla sería el peor estreno posible del rediseño.

### Maestro-detalle

Se resuelve con rutas paralelas y visibilidad por CSS. En escritorio la lista y el
panel de detalle conviven; en móvil la lista se oculta cuando hay un detalle
abierto.

El costo aceptado es que en móvil la lista se renderiza aunque no se vea. A cambio,
el enlace directo a una tarea funciona igual en los dos anchos y no hay parpadeo de
hidratación —que es lo que pasa cuando el layout se decide leyendo el viewport en
el cliente.

### Proyectos

Deja de ser un destino de primer nivel: el prototipo tiene cinco, y cinco es el
máximo cómodo en una barra inferior.

En escritorio la barra lateral los lista bajo los cinco destinos, con su color y su
conteo. En móvil son chips de filtro en `/tareas`. La pantalla de gestión sobrevive
íntegra; sólo cambia desde dónde se llega a ella.

### Captura

Hoy hay dos formularios de creación en dos sitios: `QuickAdd` incrustado en `/hoy`
y `NewHabitForm` en `/habitos`. El prototipo unifica ambos en un único punto de
entrada: un FAB que abre una hoja inferior con dos pestañas, Tarea y Hábito.

Se adopta ese punto único y **el `QuickAdd` incrustado desaparece**. Tener la
captura en un solo lugar es lo que permite que el FAB signifique siempre lo mismo
en las tres pantallas donde aparece.

- **Tarea:** título, chip de prioridad, chip de fecha y chip de proyecto. El chip
  de hora del prototipo queda fuera —es del bloque 2.
- **Hábito:** nombre, emoji y cadencia. Los campos que no caben cómodamente en una
  hoja —color, meta semanal— siguen editándose desde `/habitos`, que conserva su
  formulario completo para editar.

En escritorio el FAB pasa a ser un botón "Añadir" en la cabecera de la barra
lateral y la hoja inferior se convierte en un diálogo centrado. Es el mismo
componente `Sheet` con otra posición; no hay dos implementaciones.

## Datos

### Único cambio de esquema

```sql
alter table habits add column icon text;
```

Emoji del hábito, anulable. Sin él, las tarjetas y los chips de hábito pierden su
elemento visual principal y el rediseño se cae.

Se aplica por el MCP de Supabase y se guarda el script en `migrations/` con el
siguiente número correlativo, con su entrada en `migrations/README.md`.

### Todo lo demás se deriva

Dos módulos puros nuevos en `lib/`, probados como `streaks.ts`:

**`lib/xp.ts`**

- XP de una tarea según su prioridad (`none` 20 · `low` 40 · `medium` 60 ·
  `high` 100) y 50 por hábito marcado. Los números se afinan al implementar; lo
  que no cambia es que salen de la prioridad y no de una columna.
- XP del día y meta del día. **La meta es todo el XP disponible hoy**: tareas con
  fecha de hoy o vencidas, más los hábitos del día. Completarlo todo llena la
  barra.
- Nivel, a partir del XP histórico acumulado.

La meta fija de 1.800 XP del prototipo sólo funciona con datos falsos: un martes
con dos tareas dejaría la barra en el 12% y el indicador que debería motivar diría
que fracasaste.

**`lib/notice.ts`**

Decide el aviso de la tarjeta destacada de Inicio, por prioridad:

1. Una racha en riesgo — hábito con tres días o más sin marcar hoy.
2. Tareas vencidas arrastradas.
3. Si no hay nada que decir, la tarjeta no se pinta.

En el prototipo ese espacio lo ocupa un mensaje de IA inventado. Se conserva el
tratamiento visual y se llena con información real y accionable.

**Nivel y racha global.** El nivel necesita una consulta agregada nueva sobre el
histórico. La racha global sale de `lib/streaks.ts` aplicada al conjunto de
hábitos.

### Lo que no se deriva y por tanto no se pinta

Logros, retos mensuales y XP como saldo acumulado que no se pierde son estado
almacenado y pertenecen al bloque 4. `/progreso` se apoya mientras tanto en el
gráfico semanal y las rachas, que sí tienen datos detrás.

Esto respeta la invariante del proyecto: igual que la racha, el XP de este bloque
**nunca se almacena**.

## Manejo de errores

Sin cambios estructurales. Las Server Actions siguen devolviendo `ActionResult`,
la validación sigue compartiendo esquema Zod entre cliente y servidor, y marcar
tarea o hábito sigue siendo optimista con reversión.

Lo nuevo: la reversión también deshace el XP, la barra y el aviso, porque los tres
son derivados del mismo estado local. Si sólo se revirtiera la casilla, el usuario
vería una tarea sin marcar y unos puntos que sí se sumaron.

## Pruebas

**Vitest**, sobre los módulos puros nuevos:

- `lib/xp.ts` — XP por cada prioridad, día sin nada pendiente (meta cero, sin
  división por cero), meta que combina tareas vencidas y hábitos, nivel a partir
  de un histórico conocido.
- `lib/notice.ts` — umbral de racha en riesgo, precedencia entre aviso de racha y
  de vencidas, caso sin aviso.

**Playwright:**

- Actualizar los selectores de los tres recorridos existentes.
- Nuevo: navegar los cinco destinos en viewport móvil y en escritorio.
- Nuevo: alternar el tema y comprobar que persiste tras recargar.

## Criterios de éxito

1. Las siete pantallas son reconocibles como el prototipo en un móvil de 390px.
2. En escritorio la barra lateral y el maestro-detalle funcionan, y el enlace
   directo a una tarea abre bien en ambos anchos.
3. Ningún número en pantalla es inventado: todo sale de la base o de una función
   pura con tests.
4. En tema oscuro no hay ningún par de colores de texto por debajo de AA.
5. Los bloques 2 a 5 no obligan a rehacer las primitivas de `components/ui/`.
