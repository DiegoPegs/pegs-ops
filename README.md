# Pegs Ops

Plataforma de gestão operacional para manufatura digital.

O Pegs Ops centraliza a operação — pedidos, produção, estoque e expedição — em um
único produto, organizado como monorepo para permitir crescimento incremental.

> **Status:** bootstrap. A estrutura da stack está de pé (API, Web, banco e
> ferramentas de qualidade), sem nenhuma regra de negócio implementada.

## Stack

pnpm workspaces · Node.js 22 LTS · TypeScript · Fastify · Next.js (App Router) ·
Prisma · PostgreSQL (Docker Compose) · Tailwind CSS · shadcn/ui · Zod ·
React Hook Form · TanStack Query · Vitest · ESLint · Prettier

## Como executar

Pré-requisitos: Node.js 22+, pnpm 11+ e Docker (apenas para o PostgreSQL).

```bash
# 1. dependências
pnpm install

# 2. variáveis de ambiente
cp .env.example .env

# 3. banco de dados
pnpm db:up          # sobe o PostgreSQL via docker compose
pnpm db:migrate     # aplica as migrations

# 4. aplicações
pnpm dev            # api (:3333) + web (:3000) em paralelo
pnpm dev:api        # somente a API
pnpm dev:web        # somente o front
```

- Web: http://localhost:3000
- API: http://localhost:3333 — health check em `GET /health`

### Outros comandos

| Comando            | Descrição                                |
| ------------------ | ---------------------------------------- |
| `pnpm build`       | Build de todos os pacotes e aplicações   |
| `pnpm start`       | Executa api e web em modo produção       |
| `pnpm test`        | Testes com Vitest                        |
| `pnpm lint`        | ESLint em todo o monorepo                |
| `pnpm format`      | Prettier em todo o monorepo              |
| `pnpm typecheck`   | Checagem de tipos em todos os workspaces |
| `pnpm db:down`     | Derruba o PostgreSQL                     |
| `pnpm db:generate` | Regenera o Prisma Client                 |
| `pnpm db:studio`   | Abre o Prisma Studio                     |

## Estrutura

| Caminho           | Conteúdo                                                           |
| ----------------- | ------------------------------------------------------------------ |
| `.ai/`            | Contexto e prompts para assistentes de IA                          |
| `docs/`           | Documentação de produto, domínio, arquitetura, backlog e ADRs      |
| `apps/`           | Aplicações executáveis (`api`, `web`)                              |
| `packages/`       | Pacotes compartilhados (`domain`, `database`, `shared`, `ui`)      |
| `infrastructure/` | Infraestrutura como código, ambientes e scripts de provisionamento |
| `scripts/`        | Scripts de automação do repositório                                |
| `tools/`          | Ferramentas internas de desenvolvimento                            |

## Documentação

- [Visão](VISION.md) · [Princípios](PRINCIPLES.md) · [Roadmap](ROADMAP.md)
- [Arquitetura](docs/architecture/overview.md)
- [Domínio](docs/domain/domain-model.md)
- [ADRs](docs/adrs/README.md)

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md). Mudanças relevantes são registradas no
[CHANGELOG.md](CHANGELOG.md).

## Licença

[MIT](LICENSE)
