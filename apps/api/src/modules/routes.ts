import type { FastifyPluginAsync } from 'fastify';

import { healthRoutes } from './health/health.routes.js';
import { originRoutes } from './origin/origin.routes.js';
import { productRoutes } from './product/product.routes.js';

/**
 * Ponto único de registro dos módulos da API.
 * Cada novo módulo expõe seu próprio plugin de rotas e é registrado aqui.
 */
export const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
  await app.register(originRoutes);
  await app.register(productRoutes);
};
