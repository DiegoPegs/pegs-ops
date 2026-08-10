'use client';

import type { EventStatusDto } from '@pegs-ops/shared';
import Link from 'next/link';
import { use, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CloseEventDialog } from '@/features/events/close-event-dialog';
import { useEvent, useEventPlanning, useUpdateEvent } from '@/features/events/api';
import { PlanningTab } from '@/features/events/planning-tab';

const STATUS_LABEL: Record<EventStatusDto, string> = {
  PLANNED: 'Planejado',
  DONE: 'Realizado',
  CANCELLED: 'Cancelado',
};

function formatEventDate(value: string): string {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR');
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: event, isPending, isError, error } = useEvent(id);
  const { data: planning } = useEventPlanning(id);
  const updateEvent = useUpdateEvent(id);
  const [closing, setClosing] = useState(false);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <header>
        <Link href="/events" className="text-muted-foreground text-sm hover:underline">
          ← Eventos
        </Link>
      </header>

      {isPending && <p className="text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-destructive">{error.message}</p>}

      {event && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={event.archivedAt ? 'secondary' : 'default'}>
                  {event.archivedAt ? 'Arquivado' : STATUS_LABEL[event.status]}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  {formatEventDate(event.eventDate)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {event.status === 'PLANNED' && !event.archivedAt && (
                <Button onClick={() => setClosing(true)}>Encerrar evento</Button>
              )}

              <Select
                value={event.status}
                onValueChange={(status) => updateEvent.mutate({ status: status as EventStatusDto })}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="planning">
            <TabsList>
              <TabsTrigger value="planning">Planejamento</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
            </TabsList>

            <TabsContent value="planning" className="pt-4">
              <PlanningTab eventId={event.id} />
            </TabsContent>

            <TabsContent value="details" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dados do evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Data</p>
                    <p>{formatEventDate(event.eventDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Observações</p>
                    <p className="whitespace-pre-wrap">{event.notes ?? '—'}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {closing && (
            <CloseEventDialog
              eventId={event.id}
              eventName={event.name}
              items={planning?.items ?? []}
              onClose={() => setClosing(false)}
            />
          )}
        </>
      )}
    </main>
  );
}
