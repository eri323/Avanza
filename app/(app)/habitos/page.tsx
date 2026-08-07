import { HabitsIcon, StatTile } from '@/components/ui';
import { globalStreak } from '@/lib/streaks';
import { getTodayForUser } from '@/features/profile';
import { HabitCard, listHabitsWithProgress } from '@/features/habits';

export default async function HabitsPage() {
  const today = await getTodayForUser();
  const habits = await listHabitsWithProgress(today);

  // La racha global es la misma función de siempre aplicada al conjunto: un día
  // cuenta si se marcó cualquier hábito.
  const streak = globalStreak(
    habits.map((habit) => habit.entryDates),
    today,
  );
  const doneToday = habits.filter((habit) => habit.doneToday).length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display text-text">Hábitos</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          tone="feature"
          value={String(streak)}
          label={streak === 1 ? 'Día de racha' : 'Días de racha'}
          icon={<HabitsIcon className="size-5" />}
        />
        <StatTile
          value={`${doneToday}/${habits.length}`}
          label="Marcados hoy"
        />
      </div>

      {habits.length === 0 ? (
        <p className="text-body text-text-muted">
          Aún no tienes hábitos. Usa el botón + para crear el primero.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} today={today} />
          ))}
        </div>
      )}
    </div>
  );
}
