import type { FastifyPluginAsync } from 'fastify';

import { healthRoutes } from './health/health.routes.js';

/**
 * Ponto único de registro dos módulos da API.
 * Cada novo módulo expõe seu próprio plugin de rotas e é registrado aqui.
 */
export const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
};
