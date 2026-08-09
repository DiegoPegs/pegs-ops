'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  createVariantSchema,
  type CreateVariantInput,
  type VariantDto,
  type VariantFormValues,
} from '@pegs-ops/shared';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VariantFormProps {
  variant?: VariantDto;
  submitLabel: string;
  pending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: CreateVariantInput) => void;
  onCancel: () => void;
}

export function VariantForm({
  variant,
  submitLabel,
  pending,
  errorMessage,
  onSubmit,
  onCancel,
}: VariantFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VariantFormValues, unknown, CreateVariantInput>({
    resolver: zodResolver(createVariantSchema),
    defaultValues: {
      sku: variant?.sku ?? '',
      attributes: variant?.attributes.map(({ name, value }) => ({ name, value })) ?? [
        { name: '', value: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'attributes' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" placeholder="Opcional" {...register('sku')} />
        {errors.sku && <p className="text-destructive text-sm">{errors.sku.message}</p>}
      </div>

      <div className="space-y-3">
        <Label>Atributos</Label>

        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <div className="flex-1 space-y-1">
              <Input placeholder="Modelo" {...register(`attributes.${index}.name`)} />
              {errors.attributes?.[index]?.name && (
                <p className="text-destructive text-sm">
                  {errors.attributes[index]?.name?.message}
                </p>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <Input placeholder="Gato" {...register(`attributes.${index}.value`)} />
              {errors.attributes?.[index]?.value && (
                <p className="text-destructive text-sm">
                  {errors.attributes[index]?.value?.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              aria-label="Remover atributo"
            >
              Remover
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: '', value: '' })}
        >
          + Adicionar atributo
        </Button>
      </div>

      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando…' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
