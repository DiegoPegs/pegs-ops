import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Pegs Ops</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-1">
          <p>Sistema inicializado.</p>
          <p>API Online.</p>
          <p>Banco conectado (placeholder).</p>
        </CardContent>
      </Card>
    </main>
  );
}
