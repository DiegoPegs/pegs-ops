import {
  EventAlreadyArchivedError,
  EventItemNotFoundError,
  EventNotFoundError,
  InvalidMovementQuantityError,
  ManualActivityAlreadyArchivedError,
  ManualActivityAlreadyCompletedError,
  ManualActivityNotCompletedError,
  ManualActivityNotFoundError,
  ProductAlreadyArchivedError,
  ProductNotFoundError,
  StockMovementTypeNotFoundError,
  RecipeAlreadyArchivedError,
  RecipeNotFoundError,
  RecipeVersionAlreadyArchivedError,
  RecipeVersionNotFoundError,
  VariantAlreadyArchivedError,
  VariantAlreadyPlannedError,
  VariantNotFoundError,
} from '@pegs-ops/domain';
import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

/** Erros de domínio "não encontrado": cada módulo registra o seu aqui. */
const NOT_FOUND_ERRORS = [
  ProductNotFoundError,
  VariantNotFoundError,
  RecipeNotFoundError,
  RecipeVersionNotFoundError,
  StockMovementTypeNotFoundError,
  EventNotFoundError,
  EventItemNotFoundError,
  ManualActivityNotFoundError,
] as const;

/** Erros de domínio que representam entrada inválida do usuário. */
const BAD_REQUEST_ERRORS = [InvalidMovementQuantityError] as const;

/** Erros de domínio que representam conflito com o estado atual. */
const CONFLICT_ERRORS = [
  VariantAlreadyPlannedError,
  ManualActivityAlreadyCompletedError,
  ManualActivityNotCompletedError,
] as const;

/** Erros de domínio "já arquivado". */
const ALREADY_ARCHIVED_ERRORS = [
  ProductAlreadyArchivedError,
  VariantAlreadyArchivedError,
  RecipeAlreadyArchivedError,
  RecipeVersionAlreadyArchivedError,
  EventAlreadyArchivedError,
  ManualActivityAlreadyArchivedError,
] as const;

interface DomainError {
  code: string;
  message: string;
}

function matches(error: unknown, types: readonly (abstract new (...args: never) => object)[]) {
  return types.some((type) => error instanceof type);
}

/** P2003 é o código do Prisma para violação de chave estrangeira. */
function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2003';
}

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

    if (matches(error, BAD_REQUEST_ERRORS)) {
      const domainError = error as unknown as DomainError;

      return reply.code(400).send({ error: domainError.code, message: domainError.message });
    }

    if (matches(error, NOT_FOUND_ERRORS)) {
      const domainError = error as unknown as DomainError;

      return reply.code(404).send({ error: domainError.code, message: domainError.message });
    }

    if (matches(error, CONFLICT_ERRORS)) {
      const domainError = error as unknown as DomainError;

      return reply.code(409).send({ error: domainError.code, message: domainError.message });
    }

    if (matches(error, ALREADY_ARCHIVED_ERRORS)) {
      const domainError = error as unknown as DomainError;

      return reply.code(409).send({ error: domainError.code, message: domainError.message });
    }

    // Violação de chave estrangeira: o único vínculo hoje é Product -> Origin.
    if (isForeignKeyViolation(error)) {
      return reply.code(400).send({
        error: 'INVALID_REFERENCE',
        message: 'A origem informada não existe.',
        issues: [{ path: 'originId', message: 'A origem informada não existe.' }],
      });
    }

    request.log.error(error);

    return reply.send(error);
  });
}
