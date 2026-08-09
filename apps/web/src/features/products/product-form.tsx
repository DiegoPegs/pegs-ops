'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProductSchema,
  type CreateProductInput,
  type ProductDto,
  type ProductFormValues,
} from '@pegs-ops/shared';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';

import { useOrigins } from '@/features/products/api';
import { Button } from '@/components/ui/button';
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

/** Valor sentinela do select: o Radix não aceita SelectItem com value vazio. */
const NO_ORIGIN = 'none';

interface ProductFormProps {
  product?: ProductDto;
  submitLabel: string;
  pending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: CreateProductInput) => void;
}

export function ProductForm({
  product,
  submitLabel,
  pending,
  errorMessage,
  onSubmit,
}: ProductFormProps) {
  const { data: origins } = useOrigins();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues, unknown, CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      originId: product?.originId ?? '',
      originUrl: product?.originUrl ?? '',
      notes: product?.notes ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input id="name" {...register('name')} aria-invalid={Boolean(errors.name)} />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" rows={3} {...register('description')} />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="originId">Origem</Label>
          <Controller
            control={control}
            name="originId"
            render={({ field }) => (
              <Select
                value={field.value ? field.value : NO_ORIGIN}
                onValueChange={(value) => field.onChange(value === NO_ORIGIN ? '' : value)}
              >
                <SelectTrigger id="originId" className="w-full">
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_ORIGIN}>Sem origem</SelectItem>
                  {origins?.map((origin) => (
                    <SelectItem key={origin.id} value={origin.id}>
                      {origin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.originId && <p className="text-destructive text-sm">{errors.originId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="originUrl">URL da origem</Label>
          <Input id="originUrl" placeholder="https://…" {...register('originUrl')} />
          {errors.originUrl && (
            <p className="text-destructive text-sm">{errors.originUrl.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" rows={3} {...register('notes')} />
        {errors.notes && <p className="text-destructive text-sm">{errors.notes.message}</p>}
      </div>

      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando…' : submitLabel}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={product ? `/products/${product.id}` : '/products'}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
