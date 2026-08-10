import {
  assertValidClosing,
  calculateSoldQuantity,
  DIRECT_SALE_MOVEMENT_CODE,
  EventItemNotFoundError,
  EventNotFoundError,
  EventNotPlannedError,
  resolveSignedQuantity,
  StockMovementTypeNotFoundError,
  type Event,
  type EventItemClosing,
  type EventItemClosingResult,
  type EventItemRepository,
  type EventRepository,
  type StockMovementRepository,
  type StockMovementTypeRepository,
} from '@pegs-ops/domain';

interface Dependencies {
  events: EventRepository;
  items: EventItemRepository;
  movements: StockMovementRepository;
  movementTypes: StockMovementTypeRepository;
}

export interface CloseEventResult {
  event: Event;
  items: EventItemClosingResult[];
}

/**
 * Encerra o evento.
 *
 * O operador informa quanto levou e quanto voltou; o vendido é a diferença, e
 * cada item com venda vira uma movimentação DIRECT_SALE. Não existe entidade
 * Venda, Pedido ou Financeiro: encerrar apenas reflete a saída física do
 * estoque.
 */
export async function closeEvent(
  { events, items, movements, movementTypes }: Dependencies,
  eventId: string,
  closings: EventItemClosing[],
): Promise<CloseEventResult> {
  const event = await events.findById(eventId);

  if (!event) {
    throw new EventNotFoundError(eventId);
  }

  if (event.status !== 'PLANNED') {
    throw new EventNotPlannedError(eventId);
  }

  const eventItems = await items.listByEvent(eventId);

  // Tudo é validado antes de qualquer gravação: um encerramento pela metade
  // deixaria o estoque descrevendo um evento que não aconteceu assim.
  const resolved: EventItemClosingResult[] = closings.map((closing) => {
    const item = eventItems.find((candidate) => candidate.id === closing.itemId);

    if (!item) {
      throw new EventItemNotFoundError(closing.itemId);
    }

    assertValidClosing(closing);

    return {
      ...closing,
      variantId: item.variantId,
      soldQuantity: calculateSoldQuantity(closing.takenQuantity, closing.returnedQuantity),
    };
  });

  const sold = resolved.filter((item) => item.soldQuantity > 0);

  if (sold.length > 0) {
    const movementType = await movementTypes.findByCode(DIRECT_SALE_MOVEMENT_CODE);

    if (!movementType) {
      throw new StockMovementTypeNotFoundError(DIRECT_SALE_MOVEMENT_CODE);
    }

    for (const item of sold) {
      await movements.create({
        variantId: item.variantId,
        movementTypeId: movementType.id,
        quantity: resolveSignedQuantity(movementType.direction, item.soldQuantity),
        unitPrice: null,
        notes: `Encerramento do evento ${event.name}`,
      });
    }
  }

  const closed = await events.update(eventId, { status: 'DONE' });

  if (!closed) {
    throw new EventNotFoundError(eventId);
  }

  return { event: closed, items: resolved };
}
