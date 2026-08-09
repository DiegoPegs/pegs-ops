import {
  createVariantSchema,
  listVariantsQuerySchema,
  productIdPathParamsSchema,
  searchVariantsQuerySchema,
  updateVariantSchema,
  variantIdParamsSchema,
} from '@pegs-ops/shared';
import type { FastifyPluginAsync } from 'fastify';

import { PrismaProductRepository } from '../product/product.repository.js';
import { PrismaVariantRepository } from './variant.repository.js';
import { archiveVariant } from './use-cases/archive-variant.js';
import { createVariant } from './use-cases/create-variant.js';
import { getVariant } from './use-cases/get-variant.js';
import { searchVariants } from './use-cases/search-variants.js';
import { listVariants } from './use-cases/list-variants.js';
import { updateVariant } from './use-cases/update-variant.js';

export const variantRoutes: FastifyPluginAsync = async (app) => {
  const variantRepository = new PrismaVariantRepository();
  const productRepository = new PrismaProductRepository();

  app.post('/products/:productId/variants', async (request, reply) => {
    const { productId } = productIdPathParamsSchema.parse(request.params);
    const input = createVariantSchema.parse(request.body);
    const variant = await createVariant(variantRepository, productRepository, productId, input);

    return reply.code(201).send(variant);
  });

  app.get('/products/:productId/variants', async (request) => {
    const { productId } = productIdPathParamsSchema.parse(request.params);
    const { includeArchived } = listVariantsQuerySchema.parse(request.query);

    return listVariants(variantRepository, productRepository, productId, { includeArchived });
  });

  app.get('/variants', async (request) => {
    const { search } = searchVariantsQuerySchema.parse(request.query);

    return searchVariants(variantRepository, search);
  });

  // A Variante é navegável: a tela dedicada carrega a variante por id.
  app.get('/variants/:id', async (request) => {
    const { id } = variantIdParamsSchema.parse(request.params);

    return getVariant(variantRepository, id);
  });

  app.patch('/variants/:id', async (request) => {
    const { id } = variantIdParamsSchema.parse(request.params);
    const input = updateVariantSchema.parse(request.body);

    return updateVariant(variantRepository, id, input);
  });

  app.delete('/variants/:id', async (request, reply) => {
    const { id } = variantIdParamsSchema.parse(request.params);
    await archiveVariant(variantRepository, id);

    return reply.code(204).send();
  });
};
