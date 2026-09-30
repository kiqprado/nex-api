# NeX API

Backend dedicado do NeX, com frontend Next.js em projeto separado. Regras de domínio e arquitetura em [AGENTS.MD](./AGENTS.MD).

## Estado atual

Documentação conferida contra o commit `90dc3f7` (`feat: improve user authentication`), de 26/09/2026.

- Fastify 5, TypeScript, Zod 4 e PostgreSQL 17; Prisma 7.10 com `@prisma/adapter-pg`.
- User, Sport, Activity e ActivityPoint modelados, com instância Prisma e persistência transacional de atividades e pontos.
- Cadastro com hash argon2id e sessão JWT no cookie HTTP-only `nex_session`, com validade de sete dias.
- Hook de autenticação nas atividades, consulta do usuário atual e logout. O usuário das atividades vem do token; o UUID fixo foi removido.
- CORS restrito à origem definida em `CLIENT_URL`, com credenciais habilitadas.

**O fluxo ainda tem bloqueios:** `server.ts` não aguarda o `BuildApp()` assíncrono, e `LoginUserSchema` não declara `password`, embora o service use esse campo. O endpoint `/health` foi removido e precisa ser restaurado. As rotas abaixo descrevem a implementação, sem afirmar que o servidor ou o login estejam funcionando de ponta a ponta.

Workout é a atividade em execução; Activity é o registro finalizado. Cada ponto do percurso é persistido em ActivityPoint. A categoria resolve Sport pelo slug `running`, `walking` ou `hiking`. O banco guarda valores crus; o frontend cuida da formatação.

## Rotas implementadas

| Método e rota | Sessão obrigatória | Comportamento no código |
| --- | --- | --- |
| `POST /auth/register` | Não | Recebe password e email e/ou phone; retorna 201 com `{ user }` e cookie. Validação ou duplicidade detectada retorna 400. |
| `POST /auth/login` | Não | Busca por identifier (email, telefone ou username); caminho de sucesso retorna 200 com `{ user }` e cookie. Contrato de senha ainda incompleto. |
| `GET /auth/me` | Sim | Retorna `{ user }` com campos públicos; 401 se o usuário não existir. |
| `POST /auth/logout` | Sim | Limpa o cookie em `/` e retorna 204 sem corpo. |
| `POST /activities` | Sim | Valida e cria Activity com seus pontos na mesma transação; retorna 201 com a Activity. |
| `GET /activities` | Sim | Lista atividades do usuário com Sport, sem pontos, em ordem crescente de startedAt e sem paginação. |
| `GET /activities/:id` | Sim | Filtra por UUID e usuário; inclui Sport e pontos ordenados por timestamp. Retorna 404 quando não encontra. |

O hook lê exclusivamente o cookie `nex_session` e verifica o JWT; cookie ausente ou token inválido retorna 401. Enviar apenas `Authorization: Bearer` não autentica estas rotas. Logout remove o cookie do navegador, sem revogar o JWT no servidor.

O cadastro não recebe name/username. As respostas de auth não expõem passwordHash nem devolvem o token no JSON. No frontend, enviar `credentials: 'include'` nas chamadas fetch para a API. Em produção (`NODE_ENV=production`), o cookie usa `secure: true` e `sameSite: 'none'`; nos demais ambientes, `secure: false` e `sameSite: 'lax'`.

### Contrato de criação de Activity

`POST /activities` exige `id` UUID, `startedAt`, `finishedAt`, `totalDuration`, `activeDuration`, `distance`, `averagePace`, `averageActivePace`, `averageSpeed`, `maxSpeed`, `minSpeed`, `calories`, `elevationGain`, `steps`, `category`, `path` e `mapSnapshot`. Datas passam por coerção Zod; métricas são não negativas e steps é inteiro.

Cada ponto contém longitude, latitude, altitude, accuracy, altitudeAccuracy, speed, heading e timestamp (inteiro positivo em milissegundos, convertido para Date). Os campos nullable precisam estar presentes, mesmo com null. `path` vazio é aceito. `mapSnapshot` recebe string ou null, mas é descartado pelo service: `mapSnapshotUrl` permanece null. Storage de imagens ainda não foi implementado.

## Preparar o ambiente local

Com Node.js/npm e Docker disponíveis:

```powershell
npm.cmd ci
docker compose up -d postgres
docker compose ps
```

Configurar o `.env` local; ainda não existe `.env.example`:

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | Conexão PostgreSQL, obrigatória para a instância Prisma. |
| `JWT_SECRET` | Segredo de assinatura/verificação do JWT, obrigatório em BuildApp. |
| `CLIENT_URL` | Origem exata do frontend, incluindo protocolo e porta quando houver; obrigatória. |
| `NODE_ENV` | `production` ativa as opções de produção do cookie. |

Consultar o histórico do banco antes de aplicar migrations:

```powershell
npx.cmd prisma migrate status --config ./prisma7.config.ts
```

A migration versionada é `20260922183337_initial_core`. Ela substituiu a antiga `20260914144015_init_core` no repositório e cria as tabelas do zero. Se o banco já tem o histórico antigo, reconciliar esse histórico antes de aplicar a nova inicial; a verificação de 14/09 não valida o conjunto atual.

Para banco novo ou com histórico compatível, aplicar migrations e gerar o client:

```powershell
npm.cmd run db:deploy -- --config ./prisma7.config.ts
npm.cmd run db:generate -- --config ./prisma7.config.ts
```

Cadastrar os Sports `running`, `walking` e `hiking` antes de criar atividades; ainda não há seed reutilizável. Depois de corrigir a inicialização assíncrona indicada acima:

```powershell
npm.cmd run dev
```

O entrypoint configura porta `3333` e host `0.0.0.0`. Os exemplos usam `npm.cmd`/`npx.cmd` para PowerShell; em outros shells, usar `npm`/`npx`. O projeto ainda não fixa a versão do runtime Node.js.

## Scripts e próximas etapas

Os scripts `dev`, `build`, `start`, `typecheck`, `db:generate`, `db:migrate`, `db:deploy` e `db:studio` estão no package.json. Ainda falta `tsconfig.json`; build/typecheck e execução compilada precisam ser consolidados. O build executa `prisma generate && tsc`, sem indicar `prisma7.config.ts`.

Após editar o schema, criar uma migration incremental no banco de desenvolvimento e gerar o client:

```powershell
npm.cmd run db:migrate -- --name nome_da_alteracao --config ./prisma7.config.ts
npm.cmd run db:generate -- --config ./prisma7.config.ts
```

Prioridades de continuidade:

1. Aguardar BuildApp no entrypoint e tratar falhas de inicialização; restaurar `/health`.
2. Incluir password no contrato de login e validar cadastro/login, `/auth/me` e logout.
3. Conferir a tipagem de `request.user` com `@fastify/jwt`, configurar TypeScript e padronizar os scripts Prisma/imports para build ESM.
4. Validar cookie/CORS no frontend e isolamento das atividades entre usuários.
5. Conferir migrations e adicionar seed dos Sports; mapear erros de validação/domínio das atividades para respostas HTTP adequadas.

Esta revisão foi documental, por inspeção do código e do diff. Não executou servidor, testes HTTP, build ou migrations. O histórico didático e os detalhes da retomada ficam em `summary.md`, arquivo local ignorado pelo Git.
