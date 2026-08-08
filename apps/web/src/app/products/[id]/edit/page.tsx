'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';

import { useProduct, useUpdateProduct } from '@/features/products/api';
import { ProductForm } from '@/features/products/product-form';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isPending, isError, error } = useProduct(id);
  const updateProduct = useUpdateProduct(id);

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <header className="space-y-1">
        <Link href={`/products/${id}`} className="text-muted-foreground text-sm hover:underline">
          ← Detalhes
        </Link>
        <h1 className="text-2xl font-semibold">Editar produto</h1>
      </header>

      {isPending && <p className="text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-destructive">{error.message}</p>}

      {product && (
        <ProductForm
          product={product}
          submitLabel="Salvar alterações"
          pending={updateProduct.isPending}
          errorMessage={updateProduct.error?.message}
          onSubmit={(values) =>
            updateProduct.mutate(values, {
              onSuccess: () => router.push(`/products/${id}`),
            })
          }
        />
      )}
    </main>
  );
}
