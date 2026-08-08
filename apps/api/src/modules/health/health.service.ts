import { prisma } from '@pegs-ops/database';

export type DatabaseStatus = 'connected' | 'disconnected';

export interface HealthStatus {
  status: 'ok';
  uptime: number;
  timestamp: string;
  database: DatabaseStatus;
}

async function checkDatabase(): Promise<DatabaseStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'connected';
  } catch {
    return 'disconnected';
  }
}

export async function getHealth(): Promise<HealthStatus> {
  return {
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: await checkDatabase(),
  };
}
