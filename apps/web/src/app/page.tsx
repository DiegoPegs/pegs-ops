'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useWorkCenter } from '@/features/work-center/api';
import { CompletedToday } from '@/features/work-center/completed-today';
import { Insights } from '@/features/work-center/insights';
import { ManualActivities } from '@/features/work-center/manual-activities';
import { PendingProductions } from '@/features/work-center/pending-productions';

/**
 * Central de Trabalho: a tela inicial do Pegs Ops.
 *
 * Não é um dashboard. Ela responde "o que precisa da minha atenção agora?",
 * consultando os módulos sem alterar nenhum dado.
 */
export default function WorkCenterPage() {
  const { data, isPending, isError, error } = useWorkCenter();

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Central de Trabalho</h1>
          <p className="text-muted-foreground text-sm">O que precisa da sua atenção agora.</p>
        </div>
        <nav className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/products">Produtos</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/events">Eventos</Link>
          </Button>
        </nav>
      </header>

      <PendingProductions
        productions={data?.pendingProductions}
        isPending={isPending}
        errorMessage={isError ? error.message : null}
      />

      <ManualActivities />

      {data && <Insights insights={data.insights} />}

      <CompletedToday />
    </main>
  );
}
