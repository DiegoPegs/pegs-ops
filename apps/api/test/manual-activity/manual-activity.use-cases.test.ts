import {
  ManualActivityAlreadyArchivedError,
  ManualActivityAlreadyCompletedError,
  ManualActivityNotCompletedError,
  ManualActivityNotFoundError,
} from '@pegs-ops/domain';
import { beforeEach, describe, expect, it } from 'vitest';

import { archiveManualActivity } from '../../src/modules/manual-activity/use-cases/archive-manual-activity.js';
import { completeManualActivity } from '../../src/modules/manual-activity/use-cases/complete-manual-activity.js';
import { createManualActivity } from '../../src/modules/manual-activity/use-cases/create-manual-activity.js';
import { listManualActivities } from '../../src/modules/manual-activity/use-cases/list-manual-activities.js';
import { reopenManualActivity } from '../../src/modules/manual-activity/use-cases/reopen-manual-activity.js';
import { updateManualActivity } from '../../src/modules/manual-activity/use-cases/update-manual-activity.js';
import { InMemoryManualActivityRepository } from './in-memory-manual-activity.repository.js';

describe('use cases de ManualActivity', () => {
  let repository: InMemoryManualActivityRepository;

  beforeEach(() => {
    repository = new InMemoryManualActivityRepository();
  });

  const nova = (title = 'Comprar filamento') => createManualActivity(repository, { title });

  describe('createManualActivity', () => {
    it('nasce pendente, com prioridade média', async () => {
      const activity = await nova();

      expect(activity.priority).toBe('MEDIUM');
      expect(activity.completedAt).toBeNull();
      expect(activity.archivedAt).toBeNull();
      expect(activity.dueDate).toBeNull();
    });

    it('aceita prioridade e prazo informados', async () => {
      const activity = await createManualActivity(repository, {
        title: 'Testar STL',
        description: 'Imprimir uma amostra',
        priority: 'HIGH',
        dueDate: new Date('2026-08-15'),
      });

      expect(activity.priority).toBe('HIGH');
      expect(activity.description).toBe('Imprimir uma amostra');
      expect(activity.dueDate).toEqual(new Date('2026-08-15'));
    });
  });

  describe('updateManualActivity', () => {
    it('edita os campos informados', async () => {
      const activity = await nova();

      const updated = await updateManualActivity(repository, activity.id, {
        title: 'Comprar filamento PETG',
        priority: 'HIGH',
      });

      expect(updated.title).toBe('Comprar filamento PETG');
      expect(updated.priority).toBe('HIGH');
    });

    it('falha quando a atividade não existe', async () => {
      await expect(updateManualActivity(repository, 'inexistente', {})).rejects.toBeInstanceOf(
        ManualActivityNotFoundError,
      );
    });
  });

  describe('completeManualActivity', () => {
    it('registra o momento da conclusão', async () => {
      const activity = await nova();
      const momento = new Date('2026-08-10T15:00:00');

      const completed = await completeManualActivity(repository, activity.id, momento);

      expect(completed.completedAt).toEqual(momento);
    });

    it('recusa concluir duas vezes', async () => {
      const activity = await nova();
      await completeManualActivity(repository, activity.id);

      await expect(completeManualActivity(repository, activity.id)).rejects.toBeInstanceOf(
        ManualActivityAlreadyCompletedError,
      );
    });
  });

  describe('reopenManualActivity', () => {
    it('volta a atividade para pendente', async () => {
      const activity = await nova();
      await completeManualActivity(repository, activity.id);

      const reopened = await reopenManualActivity(repository, activity.id);

      expect(reopened.completedAt).toBeNull();
    });

    it('recusa reabrir o que não está concluído', async () => {
      const activity = await nova();

      await expect(reopenManualActivity(repository, activity.id)).rejects.toBeInstanceOf(
        ManualActivityNotCompletedError,
      );
    });
  });

  describe('archiveManualActivity', () => {
    it('arquiva logicamente, preservando o registro', async () => {
      const activity = await nova();

      const archived = await archiveManualActivity(repository, activity.id);

      expect(archived.archivedAt).toBeInstanceOf(Date);
      expect(repository.items).toHaveLength(1);
    });

    it('permite arquivar uma atividade já concluída', async () => {
      const activity = await nova();
      await completeManualActivity(repository, activity.id);

      const archived = await archiveManualActivity(repository, activity.id);

      expect(archived.archivedAt).toBeInstanceOf(Date);
      expect(archived.completedAt).toBeInstanceOf(Date);
    });

    it('recusa arquivar duas vezes', async () => {
      const activity = await nova();
      await archiveManualActivity(repository, activity.id);

      await expect(archiveManualActivity(repository, activity.id)).rejects.toBeInstanceOf(
        ManualActivityAlreadyArchivedError,
      );
    });
  });

  describe('listManualActivities', () => {
    it('esconde as arquivadas por padrão e as inclui sob demanda', async () => {
      const ativa = await nova('Ativa');
      const arquivada = await nova('Arquivada');
      await archiveManualActivity(repository, arquivada.id);

      const padrao = await listManualActivities(repository);
      expect(padrao.map((item) => item.id)).toEqual([ativa.id]);

      const todas = await listManualActivities(repository, { includeArchived: true });
      expect(todas).toHaveLength(2);
    });
  });
});
