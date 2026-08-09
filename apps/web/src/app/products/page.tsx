'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useArchiveProduct, useProducts } from '@/features/products/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ProductsPage() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data: products, isPending, isError, error } = useProducts(includeArchived);
  const archive = useArchiveProduct();

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-muted-foreground text-sm">Itens que o negócio fabrica ou revende.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIncludeArchived((value) => !value)}>
            {includeArchived ? 'Ocultar arquivados' : 'Mostrar arquivados'}
          </Button>
          <Button asChild>
            <Link href="/products/new">Novo produto</Link>
          </Button>
        </div>
      </header>

      {isPending && <p className="text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-destructive">{error.message}</p>}

      {products && products.length === 0 && (
        <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
      )}

      {products && products.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <Link href={`/products/${product.id}`} className="hover:underline">
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.origin?.name ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={product.archivedAt ? 'secondary' : 'default'}>
                    {product.archivedAt ? 'Arquivado' : 'Ativo'}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/products/${product.id}/edit`}>Editar</Link>
                  </Button>
                  {!product.archivedAt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={archive.isPending}
                      onClick={() => {
                        if (confirm(`Arquivar "${product.name}"?`)) {
                          archive.mutate(product.id);
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
