export class ManualActivityNotFoundError extends Error {
  readonly code = 'MANUAL_ACTIVITY_NOT_FOUND';

  constructor(readonly activityId: string) {
    super(`Atividade ${activityId} não encontrada.`);
    this.name = 'ManualActivityNotFoundError';
  }
}

export class ManualActivityAlreadyArchivedError extends Error {
  readonly code = 'MANUAL_ACTIVITY_ALREADY_ARCHIVED';

  constructor(readonly activityId: string) {
    super(`Atividade ${activityId} já está arquivada.`);
    this.name = 'ManualActivityAlreadyArchivedError';
  }
}

export class ManualActivityAlreadyCompletedError extends Error {
  readonly code = 'MANUAL_ACTIVITY_ALREADY_COMPLETED';

  constructor(readonly activityId: string) {
    super(`Atividade ${activityId} já está concluída.`);
    this.name = 'ManualActivityAlreadyCompletedError';
  }
}

export class ManualActivityNotCompletedError extends Error {
  readonly code = 'MANUAL_ACTIVITY_NOT_COMPLETED';

  constructor(readonly activityId: string) {
    super(`Atividade ${activityId} não está concluída.`);
    this.name = 'ManualActivityNotCompletedError';
  }
}
