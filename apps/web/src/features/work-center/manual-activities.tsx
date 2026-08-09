'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useManualActivities } from '@/features/work-center/api';

/**
 * Estrutura preparada para a próxima WO: aqui entram orçamentos, testes de STL,
 * compras e lembretes. Nesta etapa não há criação nem edição.
 */
export function ManualActivities() {
  const { data: activities } = useManualActivities();

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Atividades manuais ({activities.length})</h2>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground space-y-2 pt-6 text-sm">
            <p>Nenhuma atividade registrada.</p>
            <p className="text-xs">
              Em breve: fazer orçamento, testar STL, comprar material e lembretes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {activities.map((activity) => (
            <li key={activity.id}>
              <Card>
                <CardContent className="pt-6 text-sm">{activity.title}</CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
