/** Prioridade da atividade. Conjunto fixo, não configurável. */
export type ActivityPriority = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Atividade manual: um trabalho criado pelo usuário — fazer orçamento, testar
 * STL, comprar material, publicar vídeo, lembretes.
 *
 * Nesta etapa ela é independente: não tem origem, categoria, recorrência nem
 * vínculo com outros módulos.
 *
 * Três situações, derivadas dos campos de data:
 * pendente (`completedAt` nulo) · concluída (`completedAt` preenchido) ·
 * arquivada (`archivedAt` preenchido, some da Central).
 */
export interface ManualActivity {
  id: string;
  title: string;
  description: string | null;
  priority: ActivityPriority;
  dueDate: Date | null;
  completedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateManualActivityData {
  title: string;
  description?: string | null;
  priority?: ActivityPriority;
  dueDate?: Date | null;
}

export type UpdateManualActivityData = Partial<CreateManualActivityData>;

export function isActivityCompleted(activity: ManualActivity): boolean {
  return activity.completedAt !== null;
}

export function isActivityArchived(activity: ManualActivity): boolean {
  return activity.archivedAt !== null;
}
