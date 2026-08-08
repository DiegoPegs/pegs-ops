import { ProductAlreadyArchivedError, ProductNotFoundError } from '@pegs-ops/domain';
import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

/**
 * Traduz erros de validação e de domínio em respostas HTTP.
 * Qualquer outro erro cai no handler padrão do Fastify (500).
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos.',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    if (error instanceof ProductNotFoundError) {
      return reply.code(404).send({ error: error.code, message: error.message });
    }

    if (error instanceof ProductAlreadyArchivedError) {
      return reply.code(409).send({ error: error.code, message: error.message });
    }

    request.log.error(error);

    return reply.send(error);
  });
}
