import type { ActivityPriority, ManualActivity } from './manual-activity.entity.js';

/** HIGH antes de MEDIUM, MEDIUM antes de LOW. */
const PRIORITY_WEIGHT: Record<ActivityPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

/**
 * Ordem do "A Fazer": prioridade, depois prazo, depois data de criação.
 * Atividade sem prazo vai para o fim do seu grupo de prioridade — ela não é
 * mais urgente que uma com data marcada.
 */
export function sortToDo(activities: ManualActivity[]): ManualActivity[] {
  return [...activities].sort((a, b) => {
    const byPriority = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    if (byPriority !== 0) return byPriority;

    if (a.dueDate && b.dueDate) {
      const byDueDate = a.dueDate.getTime() - b.dueDate.getTime();
      if (byDueDate !== 0) return byDueDate;
    } else if (a.dueDate !== b.dueDate) {
      return a.dueDate ? -1 : 1;
    }

    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

/** Concluídas hoje: as mais recentes primeiro. */
export function sortCompleted(activities: ManualActivity[]): ManualActivity[] {
  return [...activities].sort(
    (a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
  );
}

/**
 * "Hoje" é o dia do operador, no fuso local — não o dia UTC. Uma conclusão às
 * 22h de Brasília pertence ao dia em que ela aconteceu para quem trabalhou.
 */
export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export interface ActivityBoard {
  toDo: ManualActivity[];
  completedToday: ManualActivity[];
}

/**
 * Separa as atividades da Central. Arquivadas nunca entram, e as concluídas em
 * dias anteriores saem da tela — o que foi feito ontem não exige atenção hoje.
 */
export function buildActivityBoard(activities: ManualActivity[], today: Date): ActivityBoard {
  const ativas = activities.filter((activity) => activity.archivedAt === null);

  return {
    toDo: sortToDo(ativas.filter((activity) => activity.completedAt === null)),
    completedToday: sortCompleted(
      ativas.filter(
        (activity) => activity.completedAt !== null && isSameLocalDay(activity.completedAt, today),
      ),
    ),
  };
}
