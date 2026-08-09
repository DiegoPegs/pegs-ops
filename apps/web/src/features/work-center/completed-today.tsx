'use client';

import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';

/**
 * Estrutura da seção, recolhida por padrão. O registro de conclusões chega com
 * o módulo de Produção; hoje ela existe para dar lugar ao que já foi feito.
 */
export function CompletedToday({ items = [] }: { items?: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

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
          <CardContent className="text-muted-foreground pt-6 text-sm">
            {items.length === 0 ? (
              <p>Nada concluído hoje ainda.</p>
            ) : (
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.id}>{item.label}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
