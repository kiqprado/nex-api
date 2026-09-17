# NeX API

Backend dedicado do aplicativo NeX.

## Stack
- Node.js
- TypeScript
- Fastify 5
- Zod 4
- PostgreSQL
- Prisma ORM 7.10
- @prisma/adapter-pg
- pg
- dotenv
- @fastify/cors

## Arquitetura

O frontend é Next.js e é um projeto separado.

Conceitos de domínio:

- Workout = atividade em execução.
- Activity = registro finalizado/persistido de um workout.

Não misturar os dois conceitos.

## Activity atual do client

A Activity produzida pelo frontend possui:

- id: string UUID
- startedAt: Date
- finishedAt: Date
- totalDuration: number
- activeDuration: number
- distance: number
- averagePace: number
- averageActivePace: number
- averageSpeed: number
- maxSpeed: number
- minSpeed: number
- calories: number
- elevationGain: number
- steps: number
- category: running | walking | hiking
- path: CurrentPosition[]
- mapSnapshot temporário no client

CurrentPosition:
- longitude
- latitude
- altitude nullable
- accuracy
- altitudeAccuracy nullable
- speed nullable
- heading nullable
- timestamp

## Persistência

No banco:

Activity é uma tabela principal.

O path NÃO deve ser salvo como array na tabela Activity.
Cada ponto deve virar ActivityPoint relacionado à Activity.

ActivityPoint:
- id
- activityId
- longitude
- latitude
- altitude nullable
- accuracy
- altitudeAccuracy nullable
- speed nullable
- heading nullable
- timestamp

A categoria do client deve ser resolvida para Sport pelo slug:
- running
- walking
- hiking

Snapshot de mapa não deve ser persistido como Base64 a longo prazo.
O banco deve armazenar URL/chave de storage futuramente.

## Primeira versão da API

Implementar apenas:
- health check
- User
- Sport
- Activity
- ActivityPoint

Rotas iniciais:
- POST /activities
- GET /activities
- GET /activities/:id

Sem likes, comments, follows, gear, achievements ou statistics por enquanto.

## Diretrizes

- Evitar overengineering.
- Modularização por domínio.
- Fastify routes -> Zod validation -> service -> repository/Prisma.
- Não criar camadas vazias só por padrão arquitetural.
- Banco guarda dados crus; frontend formata pace, duração, distância etc.
- UUID como string para entidades principais.