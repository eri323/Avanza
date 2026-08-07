import { Chip, ProgressBar, SparkIcon } from '@/components/ui';
import { getHomeData, TodayBoard } from '@/features/today';

export default async function HomePage() {
  const { today, greeting, displayName, dayTasks, habits, level } =
    await getHomeData();

  const name = displayName?.trim();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-display text-text">
              {name ? `${greeting}, ${name}` : greeting}
            </h1>
            <p className="text-label text-text-muted">
              Esto es lo que tienes hoy.
            </p>
          </div>
          <Chip tone="accent" selected className="shrink-0">
            <SparkIcon className="size-4" />
            Nivel {level.level}
          </Chip>
        </div>

        <div className="flex flex-col gap-1.5">
          <ProgressBar
            percent={level.percent}
            label={`Avance al nivel ${level.level + 1}`}
            tone="accent"
            size="sm"
          />
          <p className="text-caption text-text-muted">
            {level.xpIntoLevel} / {level.xpForNextLevel} XP para el nivel{' '}
            {level.level + 1}
          </p>
        </div>
      </header>

      <TodayBoard
        today={today}
        tasks={dayTasks.map((task) => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
          done: task.completedAt !== null,
        }))}
        habits={habits.map((habit) => ({
          id: habit.id,
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          cadence: habit.cadence,
          streak: habit.streak,
          done: habit.doneToday,
        }))}
      />
    </div>
  );
}
