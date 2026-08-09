import {
  createRecipeSchema,
  createRecipeVersionSchema,
  listArchivableQuerySchema,
  recipeIdParamsSchema,
  recipeIdPathParamsSchema,
  updateRecipeSchema,
  updateRecipeVersionSchema,
  variantIdPathParamsSchema,
} from '@pegs-ops/shared';
import type { FastifyPluginAsync } from 'fastify';

import { PrismaVariantRepository } from '../variant/variant.repository.js';
import { PrismaRecipeVersionRepository } from './recipe-version.repository.js';
import { PrismaRecipeRepository } from './recipe.repository.js';
import { archiveRecipeVersion } from './use-cases/archive-recipe-version.js';
import { archiveRecipe } from './use-cases/archive-recipe.js';
import { createRecipeVersion } from './use-cases/create-recipe-version.js';
import { createRecipe } from './use-cases/create-recipe.js';
import { listRecipeVersions } from './use-cases/list-recipe-versions.js';
import { listRecipes } from './use-cases/list-recipes.js';
import { updateRecipeVersion } from './use-cases/update-recipe-version.js';
import { updateRecipe } from './use-cases/update-recipe.js';

export const recipeRoutes: FastifyPluginAsync = async (app) => {
  const recipeRepository = new PrismaRecipeRepository();
  const versionRepository = new PrismaRecipeVersionRepository();
  const variantRepository = new PrismaVariantRepository();

  app.post('/variants/:variantId/recipes', async (request, reply) => {
    const { variantId } = variantIdPathParamsSchema.parse(request.params);
    const input = createRecipeSchema.parse(request.body);
    const recipe = await createRecipe(recipeRepository, variantRepository, variantId, input);

    return reply.code(201).send(recipe);
  });

  app.get('/variants/:variantId/recipes', async (request) => {
    const { variantId } = variantIdPathParamsSchema.parse(request.params);
    const { includeArchived } = listArchivableQuerySchema.parse(request.query);

    return listRecipes(recipeRepository, variantRepository, variantId, { includeArchived });
  });

  app.patch('/recipes/:id', async (request) => {
    const { id } = recipeIdParamsSchema.parse(request.params);
    const input = updateRecipeSchema.parse(request.body);

    return updateRecipe(recipeRepository, id, input);
  });

  app.delete('/recipes/:id', async (request, reply) => {
    const { id } = recipeIdParamsSchema.parse(request.params);
    await archiveRecipe(recipeRepository, id);

    return reply.code(204).send();
  });

  app.post('/recipes/:recipeId/versions', async (request, reply) => {
    const { recipeId } = recipeIdPathParamsSchema.parse(request.params);
    const input = createRecipeVersionSchema.parse(request.body);
    const version = await createRecipeVersion(versionRepository, recipeRepository, recipeId, input);

    return reply.code(201).send(version);
  });

  app.get('/recipes/:recipeId/versions', async (request) => {
    const { recipeId } = recipeIdPathParamsSchema.parse(request.params);
    const { includeArchived } = listArchivableQuerySchema.parse(request.query);

    return listRecipeVersions(versionRepository, recipeRepository, recipeId, { includeArchived });
  });

  app.patch('/recipe-versions/:id', async (request) => {
    const { id } = recipeIdParamsSchema.parse(request.params);
    const input = updateRecipeVersionSchema.parse(request.body);

    return updateRecipeVersion(versionRepository, id, input);
  });

  app.delete('/recipe-versions/:id', async (request, reply) => {
    const { id } = recipeIdParamsSchema.parse(request.params);
    await archiveRecipeVersion(versionRepository, id);

    return reply.code(204).send();
  });
};
