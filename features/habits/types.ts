import type { IsoDate } from '@/lib/dates';

export type Habit = {
  id: string;
  name: string;
  color: string;
  /** Emoji. Anulable: los hábitos anteriores al rediseño no lo tienen. */
  icon: string | null;
  cadence: 'daily' | 'weekly';
  targetPerWeek: number | null;
};

export type HabitWithProgress = Habit & {
  entryDates: IsoDate[];
  streak: number;
  doneToday: boolean;
};
