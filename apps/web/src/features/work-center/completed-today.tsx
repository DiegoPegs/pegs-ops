'use client';

import type { CompletedTodayItemDto } from '@pegs-ops/shared';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useReopenActivity } from '@/features/manual-activities/api';

const KIND_LABEL: Record<CompletedTodayItemDto['kind'], string> = {
  MANUAL_ACTIVITY: 'Atividade',
  PRODUCTION: 'Produção',
};

function formatTime(completedAt: string): string {
  return new Date(completedAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Seção global da Central: reúne tudo que foi concluído hoje. Hoje recebe as
 * atividades manuais; adiante, também as produções.
 */
export function CompletedToday({ items = [] }: { items?: CompletedTodayItemDto[] }) {
  const [open, setOpen] = useState(false);
  const reopenActivity = useReopenActivity();

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 text-lg font-semibold"
        aria-expanded={open}
      >
        <span aria-hidden>{open ? '▼' : '▶'}</span>
        Concluídas hoje ({items.length})
      </button>

      {open && (
        <Card>
          <CardContent className="pt-6 text-sm">
            {items.length === 0 ? (
              <p className="text-muted-foreground">Nada concluído hoje ainda.</p>
            ) : (
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-2">
                    <span>
                      <span className="text-muted-foreground">{formatTime(item.completedAt)}</span>{' '}
                      <span className={item.kind === 'PRODUCTION' ? '' : 'line-through'}>
                        {item.title}
                      </span>{' '}
                      {item.quantity !== null && (
                        <span className="font-medium">· {item.quantity} un </span>
                      )}
                      <span className="text-muted-foreground text-xs">
                        ({KIND_LABEL[item.kind]})
                      </span>
                    </span>
                    {item.kind === 'MANUAL_ACTIVITY' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={reopenActivity.isPending}
                        onClick={() => reopenActivity.mutate(item.id)}
                      >
                        Reabrir
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
