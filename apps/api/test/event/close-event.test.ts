import {
  calculateSoldQuantity,
  EventItemNotFoundError,
  EventNotFoundError,
  EventNotPlannedError,
  InvalidEventClosingQuantityError,
} from '@pegs-ops/domain';
import { beforeEach, describe, expect, it } from 'vitest';

import { closeEvent } from '../../src/modules/event/use-cases/close-event.js';
import { getCurrentStock } from '../../src/modules/inventory/use-cases/get-current-stock.js';
import {
  InMemoryStockMovementRepository,
  InMemoryStockMovementTypeRepository,
} from '../inventory/in-memory-inventory.repository.js';
import { InMemoryProductRepository } from '../product/in-memory-product.repository.js';
import { InMemoryVariantRepository } from '../variant/in-memory-variant.repository.js';
import {
  InMemoryEventItemRepository,
  InMemoryEventRepository,
} from './in-memory-event.repository.js';

describe('calculateSoldQuantity', () => {
  it('vendido é o que saiu e não voltou', () => {
    expect(calculateSoldQuantity(7, 2)).toBe(5);
    expect(calculateSoldQuantity(7, 7)).toBe(0);
    expect(calculateSoldQuantity(0, 0)).toBe(0);
  });
});

describe('closeEvent', () => {
  let events: InMemoryEventRepository;
  let items: InMemoryEventItemRepository;
  let movements: InMemoryStockMovementRepository;
  let movementTypes: InMemoryStockMovementTypeRepository;
  let variants: InMemoryVariantRepository;
  let eventId: string;
  let itemA: string;
  let itemB: string;
  let variantA: string;
  let variantB: string;

  const deps = () => ({ events, items, movements, movementTypes });

  beforeEach(async () => {
    events = new InMemoryEventRepository();
    items = new InMemoryEventItemRepository();
    movements = new InMemoryStockMovementRepository();
    movementTypes = new InMemoryStockMovementTypeRepository();
    variants = new InMemoryVariantRepository();

    const products = new InMemoryProductRepository();
    const product = await products.create({ name: 'Porta Jóias' });
    variantA = (await variants.create(product.id, { attributes: [] })).id;
    variantB = (await variants.create(product.id, { attributes: [] })).id;

    const event = await events.create({ name: 'Feira Geek', eventDate: new Date('2026-09-12') });
    eventId = event.id;
    itemA = (await items.create(eventId, { variantId: variantA, targetQuantity: 7 })).id;
    itemB = (await items.create(eventId, { variantId: variantB, targetQuantity: 5 })).id;
  });

  it('registra a venda do que não voltou e marca o evento como DONE', async () => {
    const { event, items: resultado } = await closeEvent(deps(), eventId, [
      { itemId: itemA, takenQuantity: 7, returnedQuantity: 2 },
      { itemId: itemB, takenQuantity: 5, returnedQuantity: 0 },
    ]);

    expect(event.status).toBe('DONE');
    expect(resultado.map((item) => item.soldQuantity)).toEqual([5, 5]);
    expect(movements.items).toHaveLength(2);
    expect(movements.items.every((item) => item.movementType.code === 'DIRECT_SALE')).toBe(true);
  });

  it('a venda sai do estoque com quantidade negativa', async () => {
    await closeEvent(deps(), eventId, [{ itemId: itemA, takenQuantity: 7, returnedQuantity: 2 }]);

    expect(movements.items[0]?.quantity).toBe(-5);
    await expect(getCurrentStock(movements, variants, variantA)).resolves.toMatchObject({
      balance: -5,
    });
  });

  it('não cria movimentação quando tudo voltou', async () => {
    const { event, items: resultado } = await closeEvent(deps(), eventId, [
      { itemId: itemA, takenQuantity: 7, returnedQuantity: 7 },
    ]);

    expect(resultado[0]?.soldQuantity).toBe(0);
    expect(movements.items).toHaveLength(0);
    expect(event.status).toBe('DONE');
  });

  it('encerra sem nenhuma venda quando nada foi levado', async () => {
    const { event } = await closeEvent(deps(), eventId, [
      { itemId: itemA, takenQuantity: 0, returnedQuantity: 0 },
      { itemId: itemB, takenQuantity: 0, returnedQuantity: 0 },
    ]);

    expect(movements.items).toHaveLength(0);
    expect(event.status).toBe('DONE');
  });

  describe('validações', () => {
    it('recusa retornada maior que levada', async () => {
      await expect(
        closeEvent(deps(), eventId, [{ itemId: itemA, takenQuantity: 3, returnedQuantity: 5 }]),
      ).rejects.toBeInstanceOf(InvalidEventClosingQuantityError);
    });

    it('recusa quantidades negativas', async () => {
      await expect(
        closeEvent(deps(), eventId, [{ itemId: itemA, takenQuantity: -1, returnedQuantity: 0 }]),
      ).rejects.toBeInstanceOf(InvalidEventClosingQuantityError);
    });

    it('recusa quantidades fracionadas', async () => {
      await expect(
        closeEvent(deps(), eventId, [{ itemId: itemA, takenQuantity: 2.5, returnedQuantity: 0 }]),
      ).rejects.toBeInstanceOf(InvalidEventClosingQuantityError);
    });

    it('não grava nada quando um item do lote é inválido', async () => {
      await expect(
        closeEvent(deps(), eventId, [
          { itemId: itemA, takenQuantity: 7, returnedQuantity: 0 },
          { itemId: itemB, takenQuantity: 1, returnedQuantity: 4 },
        ]),
      ).rejects.toBeInstanceOf(InvalidEventClosingQuantityError);

      expect(movements.items).toHaveLength(0);
      await expect(events.findById(eventId)).resolves.toMatchObject({ status: 'PLANNED' });
    });

    it('recusa item que não pertence ao evento', async () => {
      await expect(
        closeEvent(deps(), eventId, [
          { itemId: 'inexistente', takenQuantity: 1, returnedQuantity: 0 },
        ]),
      ).rejects.toBeInstanceOf(EventItemNotFoundError);
    });
  });

  describe('estado do evento', () => {
    it('recusa encerrar um evento já encerrado', async () => {
      await closeEvent(deps(), eventId, []);

      await expect(closeEvent(deps(), eventId, [])).rejects.toBeInstanceOf(EventNotPlannedError);
    });

    it('recusa encerrar um evento cancelado', async () => {
      await events.update(eventId, { status: 'CANCELLED' });

      await expect(closeEvent(deps(), eventId, [])).rejects.toBeInstanceOf(EventNotPlannedError);
    });

    it('falha quando o evento não existe', async () => {
      await expect(closeEvent(deps(), 'inexistente', [])).rejects.toBeInstanceOf(
        EventNotFoundError,
      );
    });
  });
});
