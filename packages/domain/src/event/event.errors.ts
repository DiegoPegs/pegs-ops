export class EventNotFoundError extends Error {
  readonly code = 'EVENT_NOT_FOUND';

  constructor(readonly eventId: string) {
    super(`Evento ${eventId} não encontrado.`);
    this.name = 'EventNotFoundError';
  }
}

export class EventAlreadyArchivedError extends Error {
  readonly code = 'EVENT_ALREADY_ARCHIVED';

  constructor(readonly eventId: string) {
    super(`Evento ${eventId} já está arquivado.`);
    this.name = 'EventAlreadyArchivedError';
  }
}

export class EventItemNotFoundError extends Error {
  readonly code = 'EVENT_ITEM_NOT_FOUND';

  constructor(readonly itemId: string) {
    super(`Item de evento ${itemId} não encontrado.`);
    this.name = 'EventItemNotFoundError';
  }
}

export class VariantAlreadyPlannedError extends Error {
  readonly code = 'VARIANT_ALREADY_PLANNED';

  constructor(readonly variantId: string) {
    super('Esta variante já faz parte do planejamento do evento.');
    this.name = 'VariantAlreadyPlannedError';
  }
}

export class EventNotPlannedError extends Error {
  readonly code = 'EVENT_NOT_PLANNED';

  constructor(readonly eventId: string) {
    super(`Evento ${eventId} não está planejado: apenas eventos PLANNED podem ser encerrados.`);
    this.name = 'EventNotPlannedError';
  }
}

export class InvalidEventClosingQuantityError extends Error {
  readonly code = 'INVALID_EVENT_CLOSING_QUANTITY';

  constructor(message: string) {
    super(message);
    this.name = 'InvalidEventClosingQuantityError';
  }
}
