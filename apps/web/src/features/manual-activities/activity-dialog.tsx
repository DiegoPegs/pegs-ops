'use client';

import type { ActivityPriorityDto, ManualActivityDto } from '@pegs-ops/shared';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateActivity, useUpdateActivity } from '@/features/manual-activities/api';

export const PRIORITY_LABEL: Record<ActivityPriorityDto, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
};

interface ActivityDialogProps {
  open: boolean;
  /** Quando presente, o modal edita; caso contrário, cria. */
  activity?: ManualActivityDto;
  onClose: () => void;
}

export function ActivityDialog({ open, activity, onClose }: ActivityDialogProps) {
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();

  const [title, setTitle] = useState(activity?.title ?? '');
  const [description, setDescription] = useState(activity?.description ?? '');
  const [priority, setPriority] = useState<ActivityPriorityDto>(activity?.priority ?? 'MEDIUM');
  const [dueDate, setDueDate] = useState(activity?.dueDate?.slice(0, 10) ?? '');

  const pending = createActivity.isPending || updateActivity.isPending;
  const error = createActivity.error ?? updateActivity.error;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const input = {
      title,
      description: description.trim() === '' ? null : description.trim(),
      priority,
      dueDate: dueDate === '' ? null : dueDate,
    };

    if (activity) {
      updateActivity.mutate({ id: activity.id, input }, { onSuccess: onClose });
    } else {
      createActivity.mutate(input, { onSuccess: onClose });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{activity ? 'Editar atividade' : 'Nova atividade'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="activity-title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="activity-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Comprar filamento, testar STL…"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-description">Descrição</Label>
            <Textarea
              id="activity-description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="activity-priority">Prioridade</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as ActivityPriorityDto)}
              >
                <SelectTrigger id="activity-priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-due">Prazo</Label>
              <Input
                id="activity-due"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error.message}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
