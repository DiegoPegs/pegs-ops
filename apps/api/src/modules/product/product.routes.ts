import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamsSchema,
  updateProductSchema,
} from '@pegs-ops/shared';
import type { FastifyPluginAsync } from 'fastify';

import { PrismaProductRepository } from './product.repository.js';
import { archiveProduct } from './use-cases/archive-product.js';
import { createProduct } from './use-cases/create-product.js';
import { getProduct } from './use-cases/get-product.js';
import { listProducts } from './use-cases/list-products.js';
import { updateProduct } from './use-cases/update-product.js';

export const productRoutes: FastifyPluginAsync = async (app) => {
  const repository = new PrismaProductRepository();

  app.post('/products', async (request, reply) => {
    const input = createProductSchema.parse(request.body);
    const product = await createProduct(repository, input);

    return reply.code(201).send(product);
  });

  app.get('/products', async (request) => {
    const { includeArchived } = listProductsQuerySchema.parse(request.query);

    return listProducts(repository, { includeArchived });
  });

  app.get('/products/:id', async (request) => {
    const { id } = productIdParamsSchema.parse(request.params);

    return getProduct(repository, id);
  });

  app.patch('/products/:id', async (request) => {
    const { id } = productIdParamsSchema.parse(request.params);
    const input = updateProductSchema.parse(request.body);

    return updateProduct(repository, id, input);
  });

  app.delete('/products/:id', async (request, reply) => {
    const { id } = productIdParamsSchema.parse(request.params);
    await archiveProduct(repository, id);

    return reply.code(204).send();
  });
};
