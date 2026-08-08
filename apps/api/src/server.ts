import { config } from 'dotenv';

config({ path: ['../../.env', '.env'], quiet: true });

const { buildApp } = await import('./app.js');
const { env } = await import('./config/env.js');

const app = await buildApp();

try {
  await app.listen({ host: env.API_HOST, port: env.API_PORT });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    await app.close();
    process.exit(0);
  });
}
