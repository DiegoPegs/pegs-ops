# Pegs Ops

Plataforma de gestão operacional para manufatura digital.

O Pegs Ops centraliza a operação — pedidos, produção, estoque e expedição — em um
único produto, organizado como monorepo para permitir crescimento incremental.

> **Status:** estrutura inicial. Ainda não há código de aplicação, dependências
> ou infraestrutura provisionada — apenas o esqueleto de diretórios e a base de
> documentação.

## Estrutura

| Caminho          | Conteúdo                                                        |
| ---------------- | --------------------------------------------------------------- |
| `.ai/`           | Contexto e prompts para assistentes de IA                        |
| `docs/`          | Documentação de produto, domínio, arquitetura, backlog e ADRs    |
| `apps/`          | Aplicações executáveis (`api`, `web`)                            |
| `packages/`      | Pacotes compartilhados (`domain`, `database`, `shared`, `ui`)    |
| `infrastructure/`| Infraestrutura como código, ambientes e scripts de provisionamento |
| `scripts/`       | Scripts de automação do repositório                              |
| `tools/`         | Ferramentas internas de desenvolvimento                          |

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
