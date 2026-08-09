import {
  RecipeAlreadyArchivedError,
  RecipeNotFoundError,
  RecipeVersionAlreadyArchivedError,
  RecipeVersionNotFoundError,
  VariantNotFoundError,
} from '@pegs-ops/domain';
import { beforeEach, describe, expect, it } from 'vitest';

import { archiveRecipeVersion } from '../../src/modules/recipe/use-cases/archive-recipe-version.js';
import { archiveRecipe } from '../../src/modules/recipe/use-cases/archive-recipe.js';
import { createRecipeVersion } from '../../src/modules/recipe/use-cases/create-recipe-version.js';
import { createRecipe } from '../../src/modules/recipe/use-cases/create-recipe.js';
import { listRecipeVersions } from '../../src/modules/recipe/use-cases/list-recipe-versions.js';
import { listRecipes } from '../../src/modules/recipe/use-cases/list-recipes.js';
import { updateRecipeVersion } from '../../src/modules/recipe/use-cases/update-recipe-version.js';
import { updateRecipe } from '../../src/modules/recipe/use-cases/update-recipe.js';
import { InMemoryProductRepository } from '../product/in-memory-product.repository.js';
import { InMemoryVariantRepository } from '../variant/in-memory-variant.repository.js';
import {
  InMemoryRecipeRepository,
  InMemoryRecipeVersionRepository,
} from './in-memory-recipe.repository.js';

describe('use cases de Recipe', () => {
  let recipes: InMemoryRecipeRepository;
  let variants: InMemoryVariantRepository;
  let variantId: string;

  beforeEach(async () => {
    recipes = new InMemoryRecipeRepository();
    variants = new InMemoryVariantRepository();

    const products = new InMemoryProductRepository();
    const product = await products.create({ name: 'Porta Jóias' });
    const variant = await variants.create(product.id, {
      attributes: [
        { name: 'Modelo', value: 'Gato' },
        { name: 'Cor', value: 'Branco' },
      ],
    });
    variantId = variant.id;
  });

  describe('createRecipe', () => {
    it('cria a receita vinculada à variante', async () => {
      const recipe = await createRecipe(recipes, variants, variantId, { name: 'Produção' });

      expect(recipe.variantId).toBe(variantId);
      expect(recipe.name).toBe('Produção');
      expect(recipe.description).toBeNull();
      expect(recipe.archivedAt).toBeNull();
    });

    it('falha quando a variante não existe', async () => {
      await expect(
        createRecipe(recipes, variants, 'inexistente', { name: 'Produção' }),
      ).rejects.toBeInstanceOf(VariantNotFoundError);
    });
  });

  describe('updateRecipe', () => {
    it('atualiza os campos informados', async () => {
      const recipe = await createRecipe(recipes, variants, variantId, { name: 'Produção' });

      const updated = await updateRecipe(recipes, recipe.id, { name: 'Alta Qualidade' });

      expect(updated.name).toBe('Alta Qualidade');
    });

    it('falha quando a receita não existe', async () => {
      await expect(updateRecipe(recipes, 'inexistente', {})).rejects.toBeInstanceOf(
        RecipeNotFoundError,
      );
    });
  });

  describe('listRecipes', () => {
    it('lista apenas as receitas da variante e esconde as arquivadas', async () => {
      const producao = await createRecipe(recipes, variants, variantId, { name: 'Produção' });
      const feira = await createRecipe(recipes, variants, variantId, { name: 'Feira' });
      await archiveRecipe(recipes, feira.id);

      const ativas = await listRecipes(recipes, variants, variantId);
      expect(ativas.map((item) => item.id)).toEqual([producao.id]);

      const todas = await listRecipes(recipes, variants, variantId, { includeArchived: true });
      expect(todas).toHaveLength(2);
    });

    it('falha quando a variante não existe', async () => {
      await expect(listRecipes(recipes, variants, 'inexistente')).rejects.toBeInstanceOf(
        VariantNotFoundError,
      );
    });
  });

  describe('archiveRecipe', () => {
    it('arquiva logicamente e recusa arquivar duas vezes', async () => {
      const recipe = await createRecipe(recipes, variants, variantId, { name: 'Produção' });

      const archived = await archiveRecipe(recipes, recipe.id);
      expect(archived.archivedAt).toBeInstanceOf(Date);
      expect(recipes.items).toHaveLength(1);

      await expect(archiveRecipe(recipes, recipe.id)).rejects.toBeInstanceOf(
        RecipeAlreadyArchivedError,
      );
    });
  });
});

describe('use cases de RecipeVersion', () => {
  let recipes: InMemoryRecipeRepository;
  let versions: InMemoryRecipeVersionRepository;
  let recipeId: string;

  beforeEach(async () => {
    recipes = new InMemoryRecipeRepository();
    versions = new InMemoryRecipeVersionRepository();

    const recipe = await recipes.create('variante-1', { name: 'Produção' });
    recipeId = recipe.id;
  });

  it('numera as versões sequencialmente por receita', async () => {
    const v1 = await createRecipeVersion(versions, recipes, recipeId, {
      printerName: 'Bambu Lab A1',
      estimatedPrintTimeMinutes: 210,
      estimatedFilamentGrams: 186,
      material: 'PLA Matte',
      estimatedCost: 8.4,
    });
    const v2 = await createRecipeVersion(versions, recipes, recipeId, {
      printerName: 'Bambu Lab P2S',
      estimatedPrintTimeMinutes: 185,
    });

    expect(v1.version).toBe(1);
    expect(v2.version).toBe(2);

    const outra = await recipes.create('variante-1', { name: 'Feira' });
    const primeiraDaOutra = await createRecipeVersion(versions, recipes, outra.id, {});
    expect(primeiraDaOutra.version).toBe(1);
  });

  it('guarda tempo em minutos, filamento em gramas e custo informado', async () => {
    const version = await createRecipeVersion(versions, recipes, recipeId, {
      estimatedPrintTimeMinutes: 225,
      estimatedFilamentGrams: 185.4,
      estimatedCost: 8.4,
      modelSourceUrl: 'https://makerworld.com/models/1',
    });

    expect(version.estimatedPrintTimeMinutes).toBe(225);
    expect(version.estimatedFilamentGrams).toBe(185.4);
    expect(version.estimatedCost).toBe(8.4);
    expect(version.modelSourceUrl).toBe('https://makerworld.com/models/1');
  });

  it('marca a primeira versão como padrão automaticamente', async () => {
    const v1 = await createRecipeVersion(versions, recipes, recipeId, {});

    expect(v1.isDefault).toBe(true);
  });

  it('ao criar uma versão como padrão, a anterior deixa de ser', async () => {
    const v1 = await createRecipeVersion(versions, recipes, recipeId, {});
    const v2 = await createRecipeVersion(versions, recipes, recipeId, { isDefault: true });

    expect(v2.isDefault).toBe(true);
    await expect(versions.findById(v1.id)).resolves.toMatchObject({ isDefault: false });
  });

  it('ao marcar a versão 2 como padrão, a versão 1 deixa de ser', async () => {
    const v1 = await createRecipeVersion(versions, recipes, recipeId, {});
    const v2 = await createRecipeVersion(versions, recipes, recipeId, {});

    expect(v1.isDefault).toBe(true);
    expect(v2.isDefault).toBe(false);

    const padrao = await updateRecipeVersion(versions, v2.id, { isDefault: true });

    expect(padrao.isDefault).toBe(true);
    await expect(versions.findById(v1.id)).resolves.toMatchObject({ isDefault: false });

    const todas = await listRecipeVersions(versions, recipes, recipeId);
    expect(todas.filter((item) => item.isDefault)).toHaveLength(1);
  });

  it('não renumera nem reaproveita o número de uma versão arquivada', async () => {
    await createRecipeVersion(versions, recipes, recipeId, {});
    const v2 = await createRecipeVersion(versions, recipes, recipeId, {});
    await archiveRecipeVersion(versions, v2.id);

    const v3 = await createRecipeVersion(versions, recipes, recipeId, {});

    expect(v3.version).toBe(3);
  });

  it('lista em ordem de versão e esconde as arquivadas', async () => {
    const v1 = await createRecipeVersion(versions, recipes, recipeId, {});
    const v2 = await createRecipeVersion(versions, recipes, recipeId, {});
    await archiveRecipeVersion(versions, v2.id);

    const ativas = await listRecipeVersions(versions, recipes, recipeId);
    expect(ativas.map((item) => item.id)).toEqual([v1.id]);

    const todas = await listRecipeVersions(versions, recipes, recipeId, { includeArchived: true });
    expect(todas.map((item) => item.version)).toEqual([1, 2]);
  });

  it('recusa arquivar a mesma versão duas vezes', async () => {
    const v1 = await createRecipeVersion(versions, recipes, recipeId, {});
    await archiveRecipeVersion(versions, v1.id);

    await expect(archiveRecipeVersion(versions, v1.id)).rejects.toBeInstanceOf(
      RecipeVersionAlreadyArchivedError,
    );
  });

  it('falha quando a receita ou a versão não existem', async () => {
    await expect(createRecipeVersion(versions, recipes, 'inexistente', {})).rejects.toBeInstanceOf(
      RecipeNotFoundError,
    );
    await expect(updateRecipeVersion(versions, 'inexistente', {})).rejects.toBeInstanceOf(
      RecipeVersionNotFoundError,
    );
    await expect(archiveRecipeVersion(versions, 'inexistente')).rejects.toBeInstanceOf(
      RecipeVersionNotFoundError,
    );
    await expect(listRecipeVersions(versions, recipes, 'inexistente')).rejects.toBeInstanceOf(
      RecipeNotFoundError,
    );
  });
});
