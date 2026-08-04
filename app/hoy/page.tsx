import { getTodayData } from '@/features/today';
import { HabitCard } from '@/features/habits';
import { QuickAdd, TaskItem } from '@/features/tasks';

export default async function TodayPage() {
  const { today, overdue, dueToday, habits, projects } = await getTodayData();

  const pendingHabits = habits.filter((habit) => !habit.doneToday);
  const nothingToDo =
    overdue.length === 0 && dueToday.length === 0 && habits.length === 0;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 p-6">
      <header>
        <h1 className="text-xl font-semibold">Hoy</h1>
        <p className="text-sm text-neutral-500">{today}</p>
      </header>

      <QuickAdd projects={projects} />

      {nothingToDo && (
        <p className="text-sm text-neutral-500">
          Nada pendiente para hoy. Añade una tarea arriba o crea un hábito.
        </p>
      )}

      {habits.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-neutral-500">
            Hábitos ({habits.length - pendingHabits.length}/{habits.length})
          </h2>
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} today={today} />
          ))}
        </section>
      )}

      {overdue.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-red-700">
            Vencidas ({overdue.length})
          </h2>
          <ul className="flex flex-col">
            {overdue.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        </section>
      )}

      {dueToday.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-neutral-500">
            Para hoy ({dueToday.length})
          </h2>
          <ul className="flex flex-col">
            {dueToday.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
