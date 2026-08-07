import { notFound } from 'next/navigation';
import { bestStreak, monthlyCompletion, type Cadence } from '@/lib/streaks';
import { getTodayForUser } from '@/features/profile';
import { getHabitById, HabitDetail } from '@/features/habits';
// `heatColumns` es pura y se importa del módulo, no del barril: el barril
// arrastra `./queries`, que es `server-only`.
import { heatColumns } from '@/features/habits/heatmap';

const HEATMAP_WEEKS = 5;

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const today = await getTodayForUser();
  const habit = await getHabitById(id, today);

  if (!habit) notFound();

  const cadence: Cadence =
    habit.cadence === 'daily'
      ? { type: 'daily' }
      : { type: 'weekly', targetPerWeek: habit.targetPerWeek! };

  // Todo se calcula aquí: la vista recibe números y no deriva nada.
  return (
    <HabitDetail
      habit={habit}
      today={today}
      best={bestStreak(habit.entryDates, cadence, today)}
      monthPercent={monthlyCompletion(habit.entryDates, cadence, today)}
      columns={heatColumns(habit.entryDates, today, HEATMAP_WEEKS)}
    />
  );
}
