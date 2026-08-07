import { getTodayForUser } from '@/features/profile';
import { HabitCard, listHabitsWithProgress, NewHabitForm } from '@/features/habits';

export default async function HabitsPage() {
  const today = await getTodayForUser();
  const habits = await listHabitsWithProgress(today);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Hábitos</h1>

      <NewHabitForm />

      {habits.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aún no tienes hábitos. Crea el primero arriba.
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
