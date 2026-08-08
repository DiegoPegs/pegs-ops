import { randomUUID } from 'node:crypto';

import { ProductAlreadyArchivedError, ProductNotFoundError, type Origin } from '@pegs-ops/domain';
import { beforeEach, describe, expect, it } from 'vitest';

import { archiveProduct } from '../../src/modules/product/use-cases/archive-product.js';
import { createProduct } from '../../src/modules/product/use-cases/create-product.js';
import { getProduct } from '../../src/modules/product/use-cases/get-product.js';
import { listProducts } from '../../src/modules/product/use-cases/list-products.js';
import { updateProduct } from '../../src/modules/product/use-cases/update-product.js';
import { InMemoryProductRepository } from './in-memory-product.repository.js';

const makerWorld: Origin = { id: randomUUID(), name: 'MakerWorld' };
const proprio: Origin = { id: randomUUID(), name: 'Próprio' };

describe('use cases de Product', () => {
  let repository: InMemoryProductRepository;

  beforeEach(() => {
    repository = new InMemoryProductRepository([makerWorld, proprio]);
  });

  describe('createProduct', () => {
    it('cria um produto sem origem, com os campos opcionais em null', async () => {
      const product = await createProduct(repository, { name: 'Vaso hexagonal' });

      expect(product.id).toBeTruthy();
      expect(product.name).toBe('Vaso hexagonal');
      expect(product.description).toBeNull();
      expect(product.originId).toBeNull();
      expect(product.originUrl).toBeNull();
      expect(product.origin).toBeNull();
      expect(product.notes).toBeNull();
      expect(product.archivedAt).toBeNull();
    });

    it('resolve a origem quando o originId é informado', async () => {
      const product = await createProduct(repository, {
        name: 'Suporte de fone',
        description: 'Suporte de mesa',
        originId: makerWorld.id,
        originUrl: 'https://makerworld.com/modelo',
        notes: 'Imprimir em PLA',
      });

      expect(product.originId).toBe(makerWorld.id);
      expect(product.origin).toEqual(makerWorld);
      expect(product.originUrl).toBe('https://makerworld.com/modelo');
      expect(product.description).toBe('Suporte de mesa');
      expect(product.notes).toBe('Imprimir em PLA');
    });
  });

  describe('getProduct', () => {
    it('devolve o produto existente', async () => {
      const created = await createProduct(repository, { name: 'Chaveiro' });

      await expect(getProduct(repository, created.id)).resolves.toMatchObject({
        id: created.id,
        name: 'Chaveiro',
      });
    });

    it('falha quando o produto não existe', async () => {
      await expect(getProduct(repository, 'inexistente')).rejects.toBeInstanceOf(
        ProductNotFoundError,
      );
    });
  });

  describe('updateProduct', () => {
    it('atualiza apenas os campos informados', async () => {
      const created = await createProduct(repository, {
        name: 'Organizador',
        notes: 'Original',
      });

      const updated = await updateProduct(repository, created.id, { name: 'Organizador V2' });

      expect(updated.name).toBe('Organizador V2');
      expect(updated.notes).toBe('Original');
    });

    it('troca a origem e mantém o vínculo resolvido', async () => {
      const created = await createProduct(repository, {
        name: 'Miniatura',
        originId: makerWorld.id,
      });

      const updated = await updateProduct(repository, created.id, { originId: proprio.id });

      expect(updated.originId).toBe(proprio.id);
      expect(updated.origin).toEqual(proprio);
    });

    it('remove a origem quando originId vira null', async () => {
      const created = await createProduct(repository, {
        name: 'Miniatura',
        originId: makerWorld.id,
      });

      const updated = await updateProduct(repository, created.id, { originId: null });

      expect(updated.originId).toBeNull();
      expect(updated.origin).toBeNull();
    });

    it('falha quando o produto não existe', async () => {
      await expect(updateProduct(repository, 'inexistente', { name: 'X' })).rejects.toBeInstanceOf(
        ProductNotFoundError,
      );
    });
  });

  describe('listProducts', () => {
    it('esconde os arquivados por padrão e os inclui sob demanda', async () => {
      const ativo = await createProduct(repository, { name: 'Ativo' });
      const arquivado = await createProduct(repository, { name: 'Arquivado' });
      await archiveProduct(repository, arquivado.id);

      const padrao = await listProducts(repository);
      expect(padrao.map((item) => item.id)).toEqual([ativo.id]);

      const todos = await listProducts(repository, { includeArchived: true });
      expect(todos).toHaveLength(2);
    });
  });

  describe('archiveProduct', () => {
    it('arquiva logicamente, preservando o registro', async () => {
      const created = await createProduct(repository, { name: 'Miniatura' });

      const archived = await archiveProduct(repository, created.id);

      expect(archived.archivedAt).toBeInstanceOf(Date);
      expect(repository.items).toHaveLength(1);
    });

    it('falha ao arquivar duas vezes', async () => {
      const created = await createProduct(repository, { name: 'Miniatura' });
      await archiveProduct(repository, created.id);

      await expect(archiveProduct(repository, created.id)).rejects.toBeInstanceOf(
        ProductAlreadyArchivedError,
      );
    });

    it('falha quando o produto não existe', async () => {
      await expect(archiveProduct(repository, 'inexistente')).rejects.toBeInstanceOf(
        ProductNotFoundError,
      );
    });
  });

  describe('existsByName', () => {
    it('responde false quando não há produto com o nome', async () => {
      await expect(repository.existsByName('Vaso')).resolves.toBe(false);
    });

    it('responde true ignorando caixa e espaços', async () => {
      await createProduct(repository, { name: 'Vaso hexagonal' });

      await expect(repository.existsByName('  vaso HEXAGONAL ')).resolves.toBe(true);
    });

    it('não é aplicado na criação: nomes duplicados continuam permitidos', async () => {
      await createProduct(repository, { name: 'Vaso hexagonal' });
      const duplicado = await createProduct(repository, { name: 'Vaso hexagonal' });

      expect(duplicado.id).toBeTruthy();
      expect(repository.items).toHaveLength(2);
    });
  });
});
