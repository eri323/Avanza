import { AlertIcon, Card, HabitsIcon } from '@/components/ui';
import { formatDayMonth } from '@/lib/dates';
import type { Notice } from '@/lib/notice';

/**
 * En el prototipo este espacio lo ocupa un mensaje de IA inventado. Se conserva
 * el tratamiento visual y se llena con información real y accionable.
 */
export function NoticeCard({ notice }: { notice: Notice }) {
  // Si no hay nada que decir, la tarjeta no se pinta.
  if (notice === null) return null;

  const { icon, title, body } =
    notice.kind === 'streak-at-risk'
      ? {
          icon: <HabitsIcon className="size-5" />,
          title: `Tu racha de ${notice.habitName} está en juego`,
          body: `Llevas ${notice.streak} días seguidos. Márcalo hoy y sigue.`,
        }
      : {
          icon: <AlertIcon className="size-5" />,
          title:
            notice.count === 1
              ? 'Tienes una tarea vencida'
              : `Tienes ${notice.count} tareas vencidas`,
          body: `La más antigua venció el ${formatDayMonth(notice.oldestDueDate)}.`,
        };

  return (
    <Card tone="feature" className="flex items-start gap-4">
      <span className="mt-0.5 shrink-0 text-accent-amber">{icon}</span>
      <div className="flex flex-col gap-1">
        <p className="text-heading text-on-feature">{title}</p>
        <p className="text-body text-on-feature-soft">{body}</p>
      </div>
    </Card>
  );
}
