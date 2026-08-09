'use client';

import type { PendingProductionDto, ProductionPriorityDto } from '@pegs-ops/shared';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const PRIORITY_LABEL: Record<ProductionPriorityDto, string> = {
  OVERDUE: 'Atrasado',
  TODAY: 'Hoje',
  URGENT: 'Urgente',
  SOON: 'Esta semana',
  PLANNED: 'Planejado',
};

/** A cor acompanha o prazo, nunca o volume. */
const PRIORITY_STYLE: Record<ProductionPriorityDto, string> = {
  OVERDUE: 'border-l-destructive',
  TODAY: 'border-l-destructive',
  URGENT: 'border-l-amber-500',
  SOON: 'border-l-amber-400',
  PLANNED: 'border-l-muted-foreground/40',
};

export function describeDays(days: number): string {
  if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'dia' : 'dias'} atrás`;
  if (days === 0) return 'hoje';
  if (days === 1) return 'amanhã';

  return `${days} dias`;
}

function variantLabel(production: PendingProductionDto): string {
  if (production.variantAttributes.length > 0) {
    return production.variantAttributes.map((attribute) => attribute.value).join(' ');
  }

  return production.variantSku ?? 'Variante';
}

function ProductionCard({ production }: { production: PendingProductionDto }) {
  return (
    <Card className={`border-l-4 ${PRIORITY_STYLE[production.priority]}`}>
      <CardContent className="space-y-3 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href={`/variants/${production.variantId}`} className="hover:underline">
              <p className="font-medium">
                {production.productName}{' '}
                <span className="text-muted-foreground">{variantLabel(production)}</span>
              </p>
            </Link>
            <p className="text-muted-foreground text-sm">
              Estoque atual: {production.currentStock}
              {production.material ? ` · ${production.material}` : ''}
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-semibold">{production.toProduce}</p>
            <p className="text-muted-foreground text-xs">
              {production.toProduce === 1 ? 'unidade' : 'unidades'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={production.daysRemaining <= 0 ? 'destructive' : 'secondary'}>
            {PRIORITY_LABEL[production.priority]}
          </Badge>
          <span className="text-muted-foreground text-sm">
            prazo mais próximo: {describeDays(production.daysRemaining)}
          </span>
        </div>

        <div className="space-y-1 border-t pt-3">
          <p className="text-muted-foreground text-xs uppercase">Origens</p>
          {production.origins.map((origin) => (
            <div key={origin.eventId} className="flex justify-between gap-4 text-sm">
              <Link href={`/events/${origin.eventId}`} className="hover:underline">
                {origin.eventName}
              </Link>
              <span className="text-muted-foreground">
                {origin.quantity} un · {describeDays(origin.daysRemaining)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PendingProductions({
  productions,
  isPending,
  errorMessage,
}: {
  productions: PendingProductionDto[] | undefined;
  isPending: boolean;
  errorMessage?: string | null;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">
        Produções pendentes {productions ? `(${productions.length})` : ''}
      </h2>

      {isPending && <p className="text-muted-foreground text-sm">Carregando…</p>}
      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}

      {productions?.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Nada pendente: o estoque cobre todos os eventos planejados.
        </p>
      )}

      <div className="grid gap-3">
        {productions?.map((production) => (
          <ProductionCard key={production.variantId} production={production} />
        ))}
      </div>
    </section>
  );
}
