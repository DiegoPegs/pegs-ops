'use client';

import type { WorkCenterDto } from '@pegs-ops/shared';

import { Card, CardContent } from '@/components/ui/card';

import { describeDays } from './pending-productions';

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);

  if (hours === 0) return `${rest}min`;
  if (rest === 0) return `${hours}h`;

  return `${hours}h ${rest}min`;
}

function formatGrams(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${Math.round(grams)} g`;
}

/**
 * Insights são apenas informação, sem ação. Custo, margem e preço não aparecem
 * aqui: pertencem ao contexto Comercial.
 */
export function Insights({ insights }: { insights: WorkCenterDto['insights'] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Insights</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="space-y-1 pt-6">
            <p className="text-muted-foreground text-sm">Tempo estimado de produção</p>
            <p className="text-2xl font-semibold">
              {formatMinutes(insights.totalPrintTimeMinutes)}
            </p>
            {insights.variantsWithoutSetup > 0 && (
              <p className="text-muted-foreground text-xs">
                {insights.variantsWithoutSetup} variante(s) sem receita não entram na conta
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-1 pt-6">
            <p className="text-muted-foreground text-sm">Filamento previsto</p>
            {insights.filamentByMaterial.length === 0 ? (
              <p className="text-muted-foreground">—</p>
            ) : (
              <ul className="space-y-1">
                {insights.filamentByMaterial.map((entry) => (
                  <li key={entry.material} className="flex justify-between gap-2">
                    <span>{entry.material}</span>
                    <span className="font-medium">{formatGrams(entry.grams)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-1 pt-6">
            <p className="text-muted-foreground text-sm">Próximo evento</p>
            {insights.nextEvent ? (
              <>
                <p className="text-lg font-semibold">{insights.nextEvent.eventName}</p>
                <p className="text-muted-foreground text-sm">
                  {describeDays(insights.nextEvent.daysRemaining)}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Nenhum evento planejado.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
