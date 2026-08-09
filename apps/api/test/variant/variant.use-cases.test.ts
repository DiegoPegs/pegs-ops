import {
  ProductNotFoundError,
  VariantAlreadyArchivedError,
  VariantNotFoundError,
} from '@pegs-ops/domain';
import { beforeEach, describe, expect, it } from 'vitest';

import { archiveVariant } from '../../src/modules/variant/use-cases/archive-variant.js';
import { createVariant } from '../../src/modules/variant/use-cases/create-variant.js';
import { listVariants } from '../../src/modules/variant/use-cases/list-variants.js';
import { updateVariant } from '../../src/modules/variant/use-cases/update-variant.js';
import { InMemoryProductRepository } from '../product/in-memory-product.repository.js';
import { InMemoryVariantRepository } from './in-memory-variant.repository.js';

describe('use cases de Variant', () => {
  let variants: InMemoryVariantRepository;
  let products: InMemoryProductRepository;
  let productId: string;

  beforeEach(async () => {
    variants = new InMemoryVariantRepository();
    products = new InMemoryProductRepository();
    const product = await products.create({ name: 'Porta Jóias' });
    productId = product.id;
  });

  describe('createVariant', () => {
    it('cria a variante com seus atributos livres', async () => {
      const variant = await createVariant(variants, products, productId, {
        attributes: [
          { name: 'Modelo', value: 'Gato' },
          { name: 'Cor', value: 'Branco' },
        ],
      });

      expect(variant.productId).toBe(productId);
      expect(variant.sku).toBeNull();
      expect(variant.archivedAt).toBeNull();
      expect(variant.attributes).toHaveLength(2);
      expect(variant.attributes.map((attribute) => [attribute.name, attribute.value])).toEqual([
        ['Modelo', 'Gato'],
        ['Cor', 'Branco'],
      ]);
      expect(variant.attributes.every((attribute) => attribute.variantId === variant.id)).toBe(
        true,
      );
    });

    it('aceita variante sem atributos e sem sku', async () => {
      const variant = await createVariant(variants, products, productId, {});

      expect(variant.attributes).toEqual([]);
      expect(variant.sku).toBeNull();
    });

    it('falha quando o produto não existe', async () => {
      await expect(createVariant(variants, products, 'inexistente', {})).rejects.toBeInstanceOf(
        ProductNotFoundError,
      );
    });
  });

  describe('updateVariant', () => {
    it('atualiza o sku sem tocar nos atributos', async () => {
      const created = await createVariant(variants, products, productId, {
        attributes: [{ name: 'Cor', value: 'Branco' }],
      });

      const updated = await updateVariant(variants, created.id, { sku: 'PJ-GATO-BR' });

      expect(updated.sku).toBe('PJ-GATO-BR');
      expect(updated.attributes).toHaveLength(1);
      expect(updated.attributes[0]?.value).toBe('Branco');
    });

    it('substitui a lista de atributos por inteiro quando ela é enviada', async () => {
      const created = await createVariant(variants, products, productId, {
        attributes: [
          { name: 'Modelo', value: 'Gato' },
          { name: 'Cor', value: 'Branco' },
        ],
      });

      const updated = await updateVariant(variants, created.id, {
        attributes: [{ name: 'Modelo', value: 'Dragão' }],
      });

      expect(updated.attributes).toHaveLength(1);
      expect(updated.attributes[0]?.value).toBe('Dragão');
    });

    it('remove todos os atributos quando a lista enviada é vazia', async () => {
      const created = await createVariant(variants, products, productId, {
        attributes: [{ name: 'Cor', value: 'Branco' }],
      });

      const updated = await updateVariant(variants, created.id, { attributes: [] });

      expect(updated.attributes).toEqual([]);
    });

    it('falha quando a variante não existe', async () => {
      await expect(updateVariant(variants, 'inexistente', {})).rejects.toBeInstanceOf(
        VariantNotFoundError,
      );
    });
  });

  describe('listVariants', () => {
    it('lista apenas as variantes do produto informado', async () => {
      const outro = await products.create({ name: 'Vaso' });
      await createVariant(variants, products, productId, {
        attributes: [{ name: 'Modelo', value: 'Gato' }],
      });
      await createVariant(variants, products, outro.id, {});

      const encontradas = await listVariants(variants, products, productId);

      expect(encontradas).toHaveLength(1);
      expect(encontradas[0]?.attributes[0]?.value).toBe('Gato');
    });

    it('esconde as arquivadas por padrão e as inclui sob demanda', async () => {
      const ativa = await createVariant(variants, products, productId, {});
      const arquivada = await createVariant(variants, products, productId, {});
      await archiveVariant(variants, arquivada.id);

      const padrao = await listVariants(variants, products, productId);
      expect(padrao.map((item) => item.id)).toEqual([ativa.id]);

      const todas = await listVariants(variants, products, productId, { includeArchived: true });
      expect(todas).toHaveLength(2);
    });

    it('falha quando o produto não existe', async () => {
      await expect(listVariants(variants, products, 'inexistente')).rejects.toBeInstanceOf(
        ProductNotFoundError,
      );
    });
  });

  describe('archiveVariant', () => {
    it('arquiva logicamente, preservando o registro', async () => {
      const created = await createVariant(variants, products, productId, {});

      const archived = await archiveVariant(variants, created.id);

      expect(archived.archivedAt).toBeInstanceOf(Date);
      expect(variants.items).toHaveLength(1);
    });

    it('falha ao arquivar duas vezes', async () => {
      const created = await createVariant(variants, products, productId, {});
      await archiveVariant(variants, created.id);

      await expect(archiveVariant(variants, created.id)).rejects.toBeInstanceOf(
        VariantAlreadyArchivedError,
      );
    });

    it('falha quando a variante não existe', async () => {
      await expect(archiveVariant(variants, 'inexistente')).rejects.toBeInstanceOf(
        VariantNotFoundError,
      );
    });
  });
});
