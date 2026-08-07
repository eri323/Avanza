import { Card, HabitsIcon, ProgressBar, SparkIcon, StatTile } from '@/components/ui';
import { getProgressData } from '@/features/progress';
import { WeeklyChart } from '@/features/progress/components/weekly-chart';

export default async function ProgressPage() {
  const { week, level, streak, bestGlobalStreak, activeDays, weekXp } =
    await getProgressData();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display text-text">Progreso</h1>

      <Card tone="feature" className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-caption uppercase text-on-feature-soft">
              Nivel {level.level}
            </span>
            <span className="text-display text-on-feature">
              {level.totalXp} XP
            </span>
          </div>
          <SparkIcon className="size-7 text-accent-amber" />
        </div>
        <ProgressBar
          percent={level.percent}
          label={`Avance al nivel ${level.level + 1}`}
          track="on-feature"
        />
        <p className="text-caption text-on-feature-soft">
          {level.xpIntoLevel} / {level.xpForNextLevel} XP para el nivel{' '}
          {level.level + 1}
        </p>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-heading text-text">Los últimos siete días</h2>
          <span className="text-label text-text-soft">{weekXp} XP</span>
        </div>
        <WeeklyChart week={week} />
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          value={String(streak)}
          label="Racha global"
          icon={<HabitsIcon className="size-5" />}
        />
        <StatTile value={String(bestGlobalStreak)} label="Mejor racha" />
        <StatTile value={`${activeDays}/7`} label="Días activos" />
      </div>
    </div>
  );
}
