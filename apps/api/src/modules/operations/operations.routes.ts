import type { FastifyPluginAsync } from 'fastify';

import { PrismaEventItemRepository } from '../event/event-item.repository.js';
import { PrismaEventRepository } from '../event/event.repository.js';
import { PrismaManualActivityRepository } from '../manual-activity/manual-activity.repository.js';
import { PrismaStockMovementRepository } from '../inventory/stock-movement.repository.js';
import { PrismaProductRepository } from '../product/product.repository.js';
import { PrismaRecipeVersionRepository } from '../recipe/recipe-version.repository.js';
import { PrismaVariantRepository } from '../variant/variant.repository.js';
import { getWorkCenter } from './use-cases/get-work-center.js';

export const operationsRoutes: FastifyPluginAsync = async (app) => {
  const dependencies = {
    events: new PrismaEventRepository(),
    items: new PrismaEventItemRepository(),
    variants: new PrismaVariantRepository(),
    products: new PrismaProductRepository(),
    movements: new PrismaStockMovementRepository(),
    versions: new PrismaRecipeVersionRepository(),
    activities: new PrismaManualActivityRepository(),
  };

  /** Somente leitura: a Central nunca altera dados. */
  app.get('/work-center', async () => getWorkCenter(dependencies));
};
