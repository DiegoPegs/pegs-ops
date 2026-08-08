import type { FastifyPluginAsync } from 'fastify';

import { PrismaOriginRepository } from './origin.repository.js';
import { listOrigins } from './use-cases/list-origins.js';

export const originRoutes: FastifyPluginAsync = async (app) => {
  const repository = new PrismaOriginRepository();

  app.get('/origins', async () => listOrigins(repository));
};
