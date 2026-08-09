import {
  createEventItemSchema,
  createEventSchema,
  eventIdParamsSchema,
  eventIdPathParamsSchema,
  listEventsQuerySchema,
  updateEventItemSchema,
  updateEventSchema,
} from '@pegs-ops/shared';
import type { FastifyPluginAsync } from 'fastify';

import { PrismaStockMovementRepository } from '../inventory/stock-movement.repository.js';
import { PrismaProductRepository } from '../product/product.repository.js';
import { PrismaRecipeVersionRepository } from '../recipe/recipe-version.repository.js';
import { PrismaVariantRepository } from '../variant/variant.repository.js';
import { PrismaEventItemRepository } from './event-item.repository.js';
import { PrismaEventRepository } from './event.repository.js';
import { addEventItem } from './use-cases/add-event-item.js';
import { archiveEvent } from './use-cases/archive-event.js';
import { createEvent } from './use-cases/create-event.js';
import { getEvent } from './use-cases/get-event.js';
import { getEventPlanning } from './use-cases/get-event-planning.js';
import { listEvents } from './use-cases/list-events.js';
import { removeEventItem } from './use-cases/remove-event-item.js';
import { updateEventItem } from './use-cases/update-event-item.js';
import { updateEvent } from './use-cases/update-event.js';

export const eventRoutes: FastifyPluginAsync = async (app) => {
  const events = new PrismaEventRepository();
  const items = new PrismaEventItemRepository();
  const variants = new PrismaVariantRepository();
  const products = new PrismaProductRepository();
  const movements = new PrismaStockMovementRepository();
  const versions = new PrismaRecipeVersionRepository();

  app.post('/events', async (request, reply) => {
    const input = createEventSchema.parse(request.body);
    const event = await createEvent(events, { ...input, eventDate: new Date(input.eventDate) });

    return reply.code(201).send(event);
  });

  app.get('/events', async (request) => {
    const { includeArchived } = listEventsQuerySchema.parse(request.query);

    return listEvents(events, { includeArchived });
  });

  app.get('/events/:id', async (request) => {
    const { id } = eventIdParamsSchema.parse(request.params);

    return getEvent(events, id);
  });

  app.patch('/events/:id', async (request) => {
    const { id } = eventIdParamsSchema.parse(request.params);
    const { eventDate, ...input } = updateEventSchema.parse(request.body);

    return updateEvent(events, id, {
      ...input,
      ...(eventDate ? { eventDate: new Date(eventDate) } : {}),
    });
  });

  app.delete('/events/:id', async (request, reply) => {
    const { id } = eventIdParamsSchema.parse(request.params);
    await archiveEvent(events, id);

    return reply.code(204).send();
  });

  app.post('/events/:eventId/items', async (request, reply) => {
    const { eventId } = eventIdPathParamsSchema.parse(request.params);
    const input = createEventItemSchema.parse(request.body);
    const item = await addEventItem(items, events, variants, eventId, input);

    return reply.code(201).send(item);
  });

  app.patch('/event-items/:id', async (request) => {
    const { id } = eventIdParamsSchema.parse(request.params);
    const input = updateEventItemSchema.parse(request.body);

    return updateEventItem(items, id, input);
  });

  app.delete('/event-items/:id', async (request, reply) => {
    const { id } = eventIdParamsSchema.parse(request.params);
    await removeEventItem(items, id);

    return reply.code(204).send();
  });

  /** Visão calculada do evento: nada aqui vem de coluna persistida. */
  app.get('/events/:eventId/planning', async (request) => {
    const { eventId } = eventIdPathParamsSchema.parse(request.params);

    return getEventPlanning({ events, items, variants, products, movements, versions }, eventId);
  });
};
