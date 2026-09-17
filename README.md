# NeX API

Backend dedicado do NeX. O frontend Next.js fica em outro projeto. As regras de domínio e arquitetura estão em [AGENTS.MD](./AGENTS.MD).

## Estado atual

- Fastify com CORS e `GET /health`, que retorna `{ "status": "ok" }` sem consultar o banco.
- Modelos User, Sport, Activity e ActivityPoint no schema Prisma.
- Migration `20260914144015_init_core` com as quatro tabelas, índices e chaves estrangeiras.
- Em 14/09/2026, `prisma migrate status` confirmou uma migration e histórico em dia no banco local `nex`.

Ainda faltam a instância Prisma com adapter, o seed das modalidades, a validação Zod e as rotas `POST /activities`, `GET /activities` e `GET /activities/:id`.

Workout é a atividade em execução; Activity é o registro finalizado. O percurso é salvo em registros ActivityPoint separados. A categoria do client deve ser resolvida para Sport pelos slugs `running`, `walking` e `hiking`.

## Executar localmente

Com Node.js/npm e Docker disponíveis:

```powershell
npm.cmd ci
docker compose up -d postgres
docker compose ps
```

Configurar `DATABASE_URL` no `.env` para o banco desejado. `prisma7.config.ts` carrega essa variável via dotenv. Ainda não há `.env.example`.

Aplicar as migrations existentes, conferir o histórico, gerar o client e iniciar o servidor:

```powershell
npm.cmd run db:deploy -- --config ./prisma7.config.ts
npx.cmd prisma migrate status --config ./prisma7.config.ts
npm.cmd run db:generate -- --config ./prisma7.config.ts
npm.cmd run dev
```

A migration inicial já está aplicada no banco local verificado; `db:deploy` aplica apenas migrations pendentes. Não é necessário recriar `init_core`.

Em outro terminal:

```powershell
Invoke-RestMethod http://localhost:3333/health
```

O servidor usa porta `3333` e host `0.0.0.0`. Os exemplos usam `npm.cmd`/`npx.cmd` para PowerShell; em outros shells, usar `npm`/`npx`.

## Próximas alterações no banco

Após editar o schema, criar a próxima migration no banco de desenvolvimento e gerar o client:

```powershell
npm.cmd run db:migrate -- --name nome_da_alteracao --config ./prisma7.config.ts
npm.cmd run db:generate -- --config ./prisma7.config.ts
```

Revisar o SQL gerado e preservar as migrations já aplicadas. Gerar o client não cria tabelas nem conecta automaticamente a aplicação ao banco.

## Próximas etapas

1. Criar `tsconfig.json` e revisar os imports para execução compilada em Node ESM.
2. Padronizar a localização de `prisma7.config.ts` nos scripts, inclusive no build. Os comandos acima passam `--config` explicitamente.
3. Instanciar Prisma com `@prisma/adapter-pg`, cadastrar modalidades e definir a associação ao usuário.
4. Implementar validação, serviço e persistência das atividades e pontos.
5. Verificar as rotas e o build de produção.

Os scripts `build`, `start` e `typecheck` existem, mas a compilação ainda depende da configuração TypeScript. O passo a passo detalhado fica no `summary.md` local, ignorado pelo Git.

## Referências oficiais

Consultar a documentação da versão declarada antes de implementar cada integração. Intervalos com ^ permitem atualizações compatíveis; as versões resolvidas estão no lockfile.

- Prisma, Client e adapter-pg 7.10.0: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
- Fastify ^5.12.3: https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/
- @fastify/cors ^11.3.0: https://github.com/fastify/fastify-cors#compatibility
- Zod ^4.6.1: https://zod.dev/v4/changelog
- pg ^8.23.0: https://node-postgres.com/
- dotenv ^17.4.2: https://github.com/motdotla/dotenv#readme
- TypeScript ^5.9.3: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html
- tsx ^4.23.13: https://tsx.is/
- @types/node ^22.20.2: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node
- @types/pg ^8.23.1: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/pg

O package.json ainda não define a versão do runtime Node.js. O Compose usa PostgreSQL 17. Os pacotes @types fornecem tipos; não instalam esses runtimes.
