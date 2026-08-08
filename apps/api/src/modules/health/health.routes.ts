import type { FastifyPluginAsync } from 'fastify';

import { getHealth } from './health.service.js';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => getHealth());
};
