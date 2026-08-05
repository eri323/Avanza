import {
  HabitsIcon,
  HomeIcon,
  ProfileIcon,
  ProgressIcon,
  TasksIcon,
} from '@/components/ui';

/** Los cinco destinos, en el orden del prototipo. */
export const NAV_ITEMS = [
  { href: '/inicio', label: 'Inicio', Icon: HomeIcon },
  { href: '/tareas', label: 'Tareas', Icon: TasksIcon },
  { href: '/habitos', label: 'Hábitos', Icon: HabitsIcon },
  { href: '/progreso', label: 'Progreso', Icon: ProgressIcon },
  { href: '/perfil', label: 'Perfil', Icon: ProfileIcon },
] as const;
