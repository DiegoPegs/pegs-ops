import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import Fastify, { type FastifyInstance } from 'fastify';

import { env } from './config/env.js';
import { routes } from './modules/routes.js';
import { registerErrorHandler } from './plugins/error-handler.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: env.NODE_ENV === 'test' ? false : { level: 'info' },
  });

  await app.register(sensible);
  await app.register(cors, { origin: env.WEB_ORIGIN });

  registerErrorHandler(app);

  await app.register(routes);

  return app;
}
