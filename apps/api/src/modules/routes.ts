import type { FastifyPluginAsync } from 'fastify';

import { eventRoutes } from './event/event.routes.js';
import { healthRoutes } from './health/health.routes.js';
import { inventoryRoutes } from './inventory/inventory.routes.js';
import { originRoutes } from './origin/origin.routes.js';
import { productRoutes } from './product/product.routes.js';
import { recipeRoutes } from './recipe/recipe.routes.js';
import { variantRoutes } from './variant/variant.routes.js';

/**
 * Ponto único de registro dos módulos da API.
 * Cada novo módulo expõe seu próprio plugin de rotas e é registrado aqui.
 */
export const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
  await app.register(originRoutes);
  await app.register(productRoutes);
  await app.register(variantRoutes);
  await app.register(recipeRoutes);
  await app.register(inventoryRoutes);
  await app.register(eventRoutes);
};
