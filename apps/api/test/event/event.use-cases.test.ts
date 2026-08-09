import {
  EventAlreadyArchivedError,
  EventItemNotFoundError,
  EventNotFoundError,
  VariantAlreadyPlannedError,
  VariantNotFoundError,
} from '@pegs-ops/domain';
import { beforeEach, describe, expect, it } from 'vitest';

import { addEventItem } from '../../src/modules/event/use-cases/add-event-item.js';
import { archiveEvent } from '../../src/modules/event/use-cases/archive-event.js';
import { createEvent } from '../../src/modules/event/use-cases/create-event.js';
import { getEvent } from '../../src/modules/event/use-cases/get-event.js';
import { listEvents } from '../../src/modules/event/use-cases/list-events.js';
import { removeEventItem } from '../../src/modules/event/use-cases/remove-event-item.js';
import { updateEventItem } from '../../src/modules/event/use-cases/update-event-item.js';
import { updateEvent } from '../../src/modules/event/use-cases/update-event.js';
import { InMemoryProductRepository } from '../product/in-memory-product.repository.js';
import { InMemoryVariantRepository } from '../variant/in-memory-variant.repository.js';
import {
  InMemoryEventItemRepository,
  InMemoryEventRepository,
} from './in-memory-event.repository.js';

describe('use cases de Event', () => {
  let events: InMemoryEventRepository;
  let items: InMemoryEventItemRepository;
  let variants: InMemoryVariantRepository;
  let variantId: string;

  beforeEach(async () => {
    events = new InMemoryEventRepository();
    items = new InMemoryEventItemRepository();
    variants = new InMemoryVariantRepository();

    const products = new InMemoryProductRepository();
    const product = await products.create({ name: 'Porta Jóias' });
    const variant = await variants.create(product.id, {
      attributes: [{ name: 'Modelo', value: 'Gato' }],
    });
    variantId = variant.id;
  });

  const novoEvento = () =>
    createEvent(events, { name: 'Feira de Artesanato', eventDate: new Date('2026-09-12') });

  describe('createEvent', () => {
    it('nasce como PLANNED', async () => {
      const event = await novoEvento();

      expect(event.status).toBe('PLANNED');
      expect(event.archivedAt).toBeNull();
      expect(event.notes).toBeNull();
    });
  });

  describe('updateEvent', () => {
    it('permite mudar o status manualmente', async () => {
      const event = await novoEvento();

      const updated = await updateEvent(events, event.id, { status: 'DONE' });

      expect(updated.status).toBe('DONE');
    });

    it('falha quando o evento não existe', async () => {
      await expect(updateEvent(events, 'inexistente', {})).rejects.toBeInstanceOf(
        EventNotFoundError,
      );
    });
  });

  describe('listEvents e getEvent', () => {
    it('ordena por data e esconde arquivados por padrão', async () => {
      const setembro = await createEvent(events, {
        name: 'Setembro',
        eventDate: new Date('2026-09-12'),
      });
      const agosto = await createEvent(events, {
        name: 'Agosto',
        eventDate: new Date('2026-08-20'),
      });
      const cancelado = await createEvent(events, {
        name: 'Cancelado',
        eventDate: new Date('2026-07-01'),
      });
      await archiveEvent(events, cancelado.id);

      const ativos = await listEvents(events);
      expect(ativos.map((item) => item.id)).toEqual([agosto.id, setembro.id]);

      const todos = await listEvents(events, { includeArchived: true });
      expect(todos).toHaveLength(3);
    });

    it('falha ao buscar evento inexistente', async () => {
      await expect(getEvent(events, 'inexistente')).rejects.toBeInstanceOf(EventNotFoundError);
    });
  });

  describe('archiveEvent', () => {
    it('arquiva logicamente e recusa arquivar duas vezes', async () => {
      const event = await novoEvento();

      const archived = await archiveEvent(events, event.id);
      expect(archived.archivedAt).toBeInstanceOf(Date);

      await expect(archiveEvent(events, event.id)).rejects.toBeInstanceOf(
        EventAlreadyArchivedError,
      );
    });
  });

  describe('addEventItem', () => {
    it('adiciona a variante com a meta informada', async () => {
      const event = await novoEvento();

      const item = await addEventItem(items, events, variants, event.id, {
        variantId,
        targetQuantity: 20,
      });

      expect(item.eventId).toBe(event.id);
      expect(item.variantId).toBe(variantId);
      expect(item.targetQuantity).toBe(20);
    });

    it('recusa a mesma variante duas vezes no mesmo evento', async () => {
      const event = await novoEvento();
      await addEventItem(items, events, variants, event.id, { variantId, targetQuantity: 20 });

      await expect(
        addEventItem(items, events, variants, event.id, { variantId, targetQuantity: 5 }),
      ).rejects.toBeInstanceOf(VariantAlreadyPlannedError);
    });

    it('falha quando o evento ou a variante não existem', async () => {
      const event = await novoEvento();

      await expect(
        addEventItem(items, events, variants, 'inexistente', { variantId, targetQuantity: 1 }),
      ).rejects.toBeInstanceOf(EventNotFoundError);

      await expect(
        addEventItem(items, events, variants, event.id, {
          variantId: 'inexistente',
          targetQuantity: 1,
        }),
      ).rejects.toBeInstanceOf(VariantNotFoundError);
    });
  });

  describe('updateEventItem e removeEventItem', () => {
    it('edita apenas a meta', async () => {
      const event = await novoEvento();
      const item = await addEventItem(items, events, variants, event.id, {
        variantId,
        targetQuantity: 20,
      });

      const updated = await updateEventItem(items, item.id, { targetQuantity: 35 });

      expect(updated.targetQuantity).toBe(35);
      expect(updated.variantId).toBe(variantId);
    });

    it('remove o item do planejamento', async () => {
      const event = await novoEvento();
      const item = await addEventItem(items, events, variants, event.id, {
        variantId,
        targetQuantity: 20,
      });

      await removeEventItem(items, item.id);

      await expect(items.listByEvent(event.id)).resolves.toHaveLength(0);
    });

    it('falha quando o item não existe', async () => {
      await expect(
        updateEventItem(items, 'inexistente', { targetQuantity: 1 }),
      ).rejects.toBeInstanceOf(EventItemNotFoundError);
      await expect(removeEventItem(items, 'inexistente')).rejects.toBeInstanceOf(
        EventItemNotFoundError,
      );
    });
  });
});
