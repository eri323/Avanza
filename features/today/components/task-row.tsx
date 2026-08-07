'use client';

import { CheckBox } from '@/components/ui';
import { formatDayMonth, type IsoDate } from '@/lib/dates';
import type { TaskPriority } from '@/features/tasks';

const PRIORITY_DOT: Record<TaskPriority, string | null> = {
  none: null,
  low: '#8B7FA8',
  medium: '#FF9C5B',
  high: '#FF5E7E',
};

export function TaskRow({
  title,
  priority,
  dueDate,
  done,
  overdue,
  onToggle,
  disabled,
}: {
  title: string;
  priority: TaskPriority;
  dueDate: IsoDate | null;
  done: boolean;
  overdue: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  const dot = PRIORITY_DOT[priority];

  return (
    <li className="flex items-center gap-3 rounded-md border border-border bg-surface-elevated px-4 py-3">
      <CheckBox
        checked={done}
        onToggle={onToggle}
        disabled={disabled}
        label={`Completar ${title}`}
      />
      {dot && (
        <span
          aria-hidden
          className="size-2 shrink-0 rounded-xl"
          style={{ backgroundColor: dot }}
        />
      )}
      <span
        className={`min-w-0 flex-1 truncate text-body ${
          done ? 'text-text-muted line-through' : 'text-text'
        }`}
      >
        {title}
      </span>
      {dueDate && (
        <span
          className={`shrink-0 text-caption ${
            overdue && !done ? 'text-accent-warm' : 'text-text-muted'
          }`}
        >
          {formatDayMonth(dueDate)}
        </span>
      )}
    </li>
  );
}
