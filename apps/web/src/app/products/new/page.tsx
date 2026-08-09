'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useCreateProduct } from '@/features/products/api';
import { ProductForm } from '@/features/products/product-form';

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <header className="space-y-1">
        <Link href="/products" className="text-muted-foreground text-sm hover:underline">
          ← Produtos
        </Link>
        <h1 className="text-2xl font-semibold">Novo produto</h1>
      </header>

      <ProductForm
        submitLabel="Cadastrar"
        pending={createProduct.isPending}
        errorMessage={createProduct.error?.message}
        onSubmit={(values) =>
          createProduct.mutate(values, {
            onSuccess: (product) => router.push(`/products/${product.id}`),
          })
        }
      />
    </main>
  );
}
