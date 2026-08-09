'use client';

import type { EventStatusDto } from '@pegs-ops/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useArchiveEvent, useCreateEvent, useEvents } from '@/features/events/api';

const STATUS_LABEL: Record<EventStatusDto, string> = {
  PLANNED: 'Planejado',
  DONE: 'Realizado',
  CANCELLED: 'Cancelado',
};

function formatEventDate(value: string): string {
  // A data vem em ISO; exibimos sem fuso para não deslocar o dia.
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR');
}

export default function EventsPage() {
  const router = useRouter();
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data: events, isPending, isError, error } = useEvents(includeArchived);
  const createEvent = useCreateEvent();
  const archiveEvent = useArchiveEvent();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    createEvent.mutate(
      { name, eventDate, status: 'PLANNED', notes: notes.trim() === '' ? null : notes.trim() },
      { onSuccess: (created) => router.push(`/events/${created.id}`) },
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Eventos</h1>
          <p className="text-muted-foreground text-sm">
            Feiras e entregas para as quais se planeja produção.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIncludeArchived((value) => !value)}>
            {includeArchived ? 'Ocultar arquivados' : 'Mostrar arquivados'}
          </Button>
          {!creating && <Button onClick={() => setCreating(true)}>Novo evento</Button>}
        </div>
      </header>

      {creating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Novo evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDate">
                    Data <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(event) => setEventDate(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>

              {createEvent.error && (
                <p className="text-destructive text-sm">{createEvent.error.message}</p>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={createEvent.isPending}>
                  {createEvent.isPending ? 'Salvando…' : 'Criar evento'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setCreating(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isPending && <p className="text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-destructive">{error.message}</p>}

      {events && events.length === 0 && !creating && (
        <p className="text-muted-foreground">Nenhum evento cadastrado ainda.</p>
      )}

      {events && events.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">
                  <Link href={`/events/${event.id}`} className="hover:underline">
                    {event.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatEventDate(event.eventDate)}
                </TableCell>
                <TableCell>
                  <Badge variant={event.archivedAt ? 'secondary' : 'default'}>
                    {event.archivedAt ? 'Arquivado' : STATUS_LABEL[event.status]}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/events/${event.id}`}>Abrir</Link>
                  </Button>
                  {!event.archivedAt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={archiveEvent.isPending}
                      onClick={() => {
                        if (confirm(`Arquivar "${event.name}"?`)) {
                          archiveEvent.mutate(event.id);
                        }
                      }}
                    >
                      Arquivar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  );
}
