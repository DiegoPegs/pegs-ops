import {
  createManualActivitySchema,
  listManualActivitiesQuerySchema,
  manualActivityIdParamsSchema,
  updateManualActivitySchema,
} from '@pegs-ops/shared';
import type { FastifyPluginAsync } from 'fastify';

import { PrismaManualActivityRepository } from './manual-activity.repository.js';
import { archiveManualActivity } from './use-cases/archive-manual-activity.js';
import { completeManualActivity } from './use-cases/complete-manual-activity.js';
import { createManualActivity } from './use-cases/create-manual-activity.js';
import { listManualActivities } from './use-cases/list-manual-activities.js';
import { reopenManualActivity } from './use-cases/reopen-manual-activity.js';
import { updateManualActivity } from './use-cases/update-manual-activity.js';

export const manualActivityRoutes: FastifyPluginAsync = async (app) => {
  const repository = new PrismaManualActivityRepository();

  app.post('/manual-activities', async (request, reply) => {
    const { dueDate, ...input } = createManualActivitySchema.parse(request.body);
    const activity = await createManualActivity(repository, {
      ...input,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    return reply.code(201).send(activity);
  });

  app.get('/manual-activities', async (request) => {
    const { includeArchived } = listManualActivitiesQuerySchema.parse(request.query);

    return listManualActivities(repository, { includeArchived });
  });

  app.patch('/manual-activities/:id', async (request) => {
    const { id } = manualActivityIdParamsSchema.parse(request.params);
    const { dueDate, ...input } = updateManualActivitySchema.parse(request.body);

    return updateManualActivity(repository, id, {
      ...input,
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
    });
  });

  /** DELETE arquiva: nada é apagado de fato (D-002). */
  app.delete('/manual-activities/:id', async (request, reply) => {
    const { id } = manualActivityIdParamsSchema.parse(request.params);
    await archiveManualActivity(repository, id);

    return reply.code(204).send();
  });

  app.post('/manual-activities/:id/complete', async (request) => {
    const { id } = manualActivityIdParamsSchema.parse(request.params);

    return completeManualActivity(repository, id);
  });

  app.post('/manual-activities/:id/reopen', async (request) => {
    const { id } = manualActivityIdParamsSchema.parse(request.params);

    return reopenManualActivity(repository, id);
  });
};
