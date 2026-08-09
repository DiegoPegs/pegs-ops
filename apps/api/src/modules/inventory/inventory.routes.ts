import { createStockMovementSchema, variantIdStockParamsSchema } from '@pegs-ops/shared';
import type { FastifyPluginAsync } from 'fastify';

import { PrismaVariantRepository } from '../variant/variant.repository.js';
import { PrismaStockMovementTypeRepository } from './stock-movement-type.repository.js';
import { PrismaStockMovementRepository } from './stock-movement.repository.js';
import { createStockMovement } from './use-cases/create-stock-movement.js';
import { getCurrentStock } from './use-cases/get-current-stock.js';
import { listStockMovements } from './use-cases/list-stock-movements.js';

export const inventoryRoutes: FastifyPluginAsync = async (app) => {
  const movementRepository = new PrismaStockMovementRepository();
  const movementTypeRepository = new PrismaStockMovementTypeRepository();
  const variantRepository = new PrismaVariantRepository();

  // Os tipos são dados de configuração: a interface precisa deles para oferecer
  // as ações rápidas sem conhecer ids fixos.
  app.get('/stock-movement-types', async () => movementTypeRepository.list());

  app.post('/stock-movements', async (request, reply) => {
    const input = createStockMovementSchema.parse(request.body);
    const movement = await createStockMovement(
      movementRepository,
      movementTypeRepository,
      variantRepository,
      input,
    );

    return reply.code(201).send(movement);
  });

  app.get('/variants/:variantId/stock', async (request) => {
    const { variantId } = variantIdStockParamsSchema.parse(request.params);

    return getCurrentStock(movementRepository, variantRepository, variantId);
  });

  app.get('/variants/:variantId/stock-movements', async (request) => {
    const { variantId } = variantIdStockParamsSchema.parse(request.params);

    return listStockMovements(movementRepository, variantRepository, variantId);
  });
};
