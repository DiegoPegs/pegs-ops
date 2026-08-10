'use client';

import type { ManualActivityDto } from '@pegs-ops/shared';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityDialog, PRIORITY_LABEL } from '@/features/manual-activities/activity-dialog';
import { useArchiveActivity, useCompleteActivity } from '@/features/manual-activities/api';

function formatDueDate(dueDate: string): string {
  // A data vem em ISO; exibimos sem fuso para não deslocar o dia.
  return new Date(`${dueDate.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR');
}

function ActivityRow({
  activity,
  onEdit,
}: {
  activity: ManualActivityDto;
  onEdit: (activity: ManualActivityDto) => void;
}) {
  const completeActivity = useCompleteActivity();
  const archiveActivity = useArchiveActivity();

  return (
    <Card>
      <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-6">
        <div className="space-y-1">
          <p className="font-medium">{activity.title}</p>
          {activity.description && (
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {activity.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={activity.priority === 'HIGH' ? 'destructive' : 'secondary'}>
              {PRIORITY_LABEL[activity.priority]}
            </Badge>
            {activity.dueDate && (
              <span className="text-muted-foreground text-sm">
                prazo: {formatDueDate(activity.dueDate)}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={completeActivity.isPending}
            onClick={() => completeActivity.mutate(activity.id)}
          >
            Concluir
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(activity)}>
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={archiveActivity.isPending}
            onClick={() => {
              if (confirm(`Arquivar "${activity.title}"?`)) {
                archiveActivity.mutate(activity.id);
              }
            }}
          >
            Arquivar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ManualActivities({ activities }: { activities: ManualActivityDto[] | undefined }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ManualActivityDto | null>(null);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Atividades ({activities?.length ?? 0})</h2>
        <Button onClick={() => setCreating(true)}>Nova atividade</Button>
      </div>

      {activities?.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground pt-6 text-sm">
            Nenhuma atividade pendente.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-2">
        {activities?.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} onEdit={setEditing} />
        ))}
      </div>

      {creating && <ActivityDialog open onClose={() => setCreating(false)} />}
      {editing && (
        <ActivityDialog key={editing.id} open activity={editing} onClose={() => setEditing(null)} />
      )}
    </section>
  );
}
