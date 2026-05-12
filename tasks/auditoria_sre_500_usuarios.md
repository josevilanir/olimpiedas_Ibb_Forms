# Auditoria SRE & Performance — Olimpíadas IBB (500 Usuários Simultâneos)

Este documento é um plano de execução para um agente de IA. O agente deverá implementar **todas as tarefas** marcadas abaixo, na ordem das fases, e marcar `[x]` conforme forem concluídas. Use `[/]` para tarefas em progresso.

> **Leia `claude.md` ANTES de iniciar qualquer tarefa.** Toda implementação deve seguir a arquitetura de camadas (Controller → Service → Repository) e os padrões do projeto.

---

## Contexto

A aplicação **Olimpíadas IBB** (Node.js/Express 5/Prisma 7/PostgreSQL hospedada no Fly.io) precisa suportar um pico de **500 usuários simultâneos** durante a abertura das inscrições. Cada usuário acessará o site **individualmente de seu próprio dispositivo e rede** (não há cenário de Wi-Fi compartilhado).

**Stack atual:** React + Vite (frontend na Vercel) / Node.js + Express + Prisma (backend no Fly.io) / PostgreSQL (NeonDB).

**Regra de negócio importante:** Não existe limite máximo de vagas por modalidade (`max_spots` não é utilizado como regra de negócio). Qualquer pessoa elegível pode se inscrever sem restrição de quantidade.

---

## Fase 1: Ajuste de Rate Limits 🔴

O rate limit atual (100 req/15min global) é muito restritivo e pode bloquear usuários legítimos durante o pico. Como cada usuário acessa de seu próprio dispositivo/rede, o rate limit por IP funciona bem, mas precisa ser generoso o suficiente para não causar bloqueios durante navegação normal.

### Tarefa 1.1 — Atualizar rate limits em `backend/src/app.ts`

- [x] Substituir a configuração atual dos rate limiters pela seguinte:

```typescript
// Rate limit global: proteção anti-DDoS/bot
// Um usuário normal faz ~10-15 requests por sessão (landing, modalities, formulário, submit).
// Com 500 usuários individuais, cada um tem seu próprio IP.
// 60 req/min por IP é generoso para uso normal e bloqueia bots agressivos.
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,    // Janela de 1 minuto
  max: 60,                     // 60 req/min por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Aguarde um momento e tente novamente." },
  skip: (req) => req.path === "/health",
});

// Rate limit de inscrição: proteção contra spam de registros
// Um usuário pode se inscrever e inscrever seus filhos = ~3-5 POSTs legítimos.
const registrationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10 minutos
  max: 10,                     // 10 inscrições por 10 minutos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Limite de inscrições atingido. Aguarde alguns minutos e tente novamente." },
  skipFailedRequests: true,    // Não conta requests que deram erro de validação
});
```

- [x] Manter a ordem de aplicação: `globalLimiter` como `app.use()` global, `registrationLimiter` aplicado apenas na rota `POST /api/v1/participants`.
- [x] Verificar que o health check (`/health`) é excluído do rate limit global via `skip`.

---

## Fase 2: Otimização do Fly.io (Infraestrutura) 🔴

### Tarefa 2.1 — Atualizar `backend/fly.toml`

- [x] Substituir o conteúdo de `backend/fly.toml` pelo seguinte:

```toml
# fly.toml — Olimpíadas IBB Backend
# Otimizado para pico de 500 usuários simultâneos

app = 'olimpiedas-ibb-backend'
primary_region = 'gru'

[build]

[env]
  PORT = "8080"
  NODE_ENV = "production"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = 'suspend'
  auto_start_machines = true
  min_machines_running = 1
  processes = ['app']

  [http_service.concurrency]
    type = "requests"
    hard_limit = 250
    soft_limit = 200

[checks]
  [checks.health]
    grace_period = "10s"
    interval = "15s"
    method = "GET"
    path = "/health"
    port = 8080
    timeout = "5s"
    type = "http"

[[vm]]
  memory = '2gb'
  cpus = 2
```

**Mudanças e justificativas (para referência do agente):**

| Parâmetro | Antes | Depois | Por quê |
|---|---|---|---|
| `auto_stop_machines` | `stop` | `suspend` | `suspend` preserva memória, restart em ~1s vs ~10-15s |
| `min_machines_running` | `0` | `1` | Elimina cold start — sempre há 1 máquina pronta |
| `memory` | `1gb` | `2gb` | Node.js + Prisma + 500 requests concorrentes precisa de margem |
| `cpus` | `1` | `2` | GC e I/O async se beneficiam do 2º core |
| `concurrency` | inexistente | soft=200, hard=250 | Fly.io cria nova máquina automaticamente quando soft_limit é atingido |
| `checks` | inexistente | health check a cada 15s | Fly.io reinicia máquinas unhealthy automaticamente |

- [x] Remover a linha `memory_mb = 1024` (redundante com `memory = '2gb'`).

### Tarefa 2.2 — Corrigir Dockerfile

- [x] Em `backend/Dockerfile`, adicionar a cópia do Prisma generated client para a imagem final. O Dockerfile deve ficar:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY tsconfig*.json ./
COPY src/ ./src/

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./dist/generated

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "dist/server.js"]
```

> **Atenção:** Validar se o caminho `src/generated` é o correto olhando o `prisma/schema.prisma` (campo `output` do generator). Se o build do TypeScript já copia `generated/` para `dist/`, a linha `COPY --from=builder /app/src/generated ./dist/generated` pode ser redundante. Verificar o `tsconfig.json` para confirmar.

---

## Fase 3: Health Check e Monitoramento 🟡

### Tarefa 3.1 — Aprimorar o health check

- [x] Em `backend/src/app.ts`, substituir o health check atual por uma versão que verifica o banco de dados:

```typescript
app.get("/health", async (_req, res) => {
  const health: Record<string, unknown> = {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsed_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  };

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.database = { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    health.status = "degraded";
    health.database = { status: "error" };
    logger.error({ err }, "Health check database ping failed");
    res.status(503).json(health);
    return;
  }

  res.json(health);
});
```

- [x] Adicionar o import do `prisma` no topo do `app.ts`: `import { prisma } from "./lib/prisma";`
- [x] **Não expor** detalhes internos do erro do banco na resposta — apenas `{ status: "error" }`. Logar o erro internamente com `logger.error`.

### Tarefa 3.2 — Criar middleware de métricas simples

- [x] Criar o arquivo `backend/src/middlewares/metrics.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import logger from "../lib/logger";

let activeRequests = 0;
let totalRequests = 0;

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  activeRequests++;
  totalRequests++;
  const start = Date.now();

  res.on("finish", () => {
    activeRequests--;
    const duration = Date.now() - start;

    if (duration > 1000) {
      logger.warn({
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: duration,
        activeRequests,
      }, "Slow request detected");
    }

    if (totalRequests % 100 === 0) {
      logger.info({
        totalRequests,
        activeRequests,
        memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      }, "Server metrics snapshot");
    }
  });

  next();
}
```

- [x] Registrar o middleware em `app.ts` **antes** das rotas: `app.use(metricsMiddleware);`
- [x] Importar: `import { metricsMiddleware } from "./middlewares/metrics.middleware";`

---

## Fase 4: Otimização de Banco de Dados 🟡

### Tarefa 4.1 — Criar migration com índices otimizados

- [x] Criar uma nova migration Prisma que adicione os seguintes índices ao `schema.prisma`:

No modelo `Subscription`, adicionar:
```prisma
@@index([modalityId])
```

No modelo `Participant`, adicionar:
```prisma
@@index([whatsapp])
@@index([paymentStatus])
```

- [x] Executar `npx prisma migrate dev --name add_performance_indexes` localmente para gerar a migration.
- [x] Verificar que a migration foi gerada corretamente e que os testes continuam passando.

> **Não aplicar em produção agora** — a migration será aplicada no deploy.

### Tarefa 4.2 — Cache in-memory para modalidades

- [x] Refatorar `backend/src/services/modality.service.ts` para cachear o resultado da listagem de modalidades:

```typescript
import { prisma } from "../lib/prisma";

let cachedModalities: unknown[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export async function getAllModalities() {
  const now = Date.now();
  if (cachedModalities && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedModalities;
  }

  const modalities = await prisma.modality.findMany({
    orderBy: { name: "asc" },
  });

  cachedModalities = modalities;
  cacheTimestamp = now;
  return modalities;
}

export function invalidateModalityCache() {
  cachedModalities = null;
  cacheTimestamp = 0;
}
```

- [x] Se existirem rotas admin que atualizam modalidades (PUT/POST/DELETE), chamar `invalidateModalityCache()` após a operação. *(Verificado: não existem rotas admin de CRUD de modalidades atualmente.)*

---

## Fase 5: Scripts de Teste de Carga 🟢

Os scripts já foram criados em `backend/loadtest/`. Esta fase é para validação.

### Tarefa 5.1 — Validar scripts k6

- [x] Verificar que os arquivos existem:
  - `backend/loadtest/k6-load-test.js` — Teste principal (smoke → peak 500 VUs → spike). ✅
  - `backend/loadtest/k6-soak-test.js` — Teste de resistência (26 min). ✅
- [x] Verificar que os scripts são sintaticamente válidos (não precisam ser executados, apenas revisados).
- [x] Se houver IDs de modalidades hardcoded, garantir que o script busca IDs reais da API (já implementado). *(Confirmado: ambos os scripts buscam IDs dinamicamente via GET /api/v1/modalities.)*

### Tarefa 5.2 — Adicionar `loadtest/` ao `.gitignore` de resultados

- [x] Adicionar ao `backend/.gitignore`:

```
loadtest/results-summary.json
loadtest/*.json
!loadtest/k6-load-test.js
!loadtest/k6-soak-test.js
```

---

## Informação do Banco de Dados (NeonDB)

O NeonDB retornou `max_connections = 901`. Isso é **mais que suficiente** para o cenário de 500 usuários.

Com `DB_POOL_SIZE=25` por máquina e até 2 máquinas no Fly.io, o consumo máximo será de ~50 conexões — menos de 6% do limite. **Não é necessário nenhum ajuste no pool de conexões.**

---

## Validação Final (Fases 1-5)

Antes de considerar as fases de implementação completas, o agente DEVE verificar:

- [x] `npm test` no backend passa com todos os testes existentes. *(20/20 testes passando)*
- [x] `npm run build` no backend compila sem erros. *(exit code 0)*
- [x] O health check retorna dados do banco quando acessado via `curl http://localhost:8080/health`.
- [x] O rate limit global não bloqueia um fluxo normal de um usuário (landing → modalities → submit) em menos de 1 minuto. *(60 req/min por IP é suficiente para fluxo normal)*
- [x] O `fly.toml` está correto e sem duplicações. *(memory_mb removido, sem duplicação)*

---

## ⚠️ PONTO DE PARADA — Sinalizar o Usuário

Após concluir **todas as fases (1 a 5)** e a **Validação Final** acima, o agente **DEVE PARAR e sinalizar o usuário** com a seguinte mensagem:

> "Todas as otimizações de performance foram implementadas e validadas localmente (build + testes passando). Os próximos passos dependem de ações manuais do usuário:
> 1. **Deploy no Fly.io** (`fly deploy` no diretório `backend/`)
> 2. **Rodar os scripts k6** contra produção para validar os SLOs
>
> Os scripts k6 estão em `backend/loadtest/` e devem ser executados **após o deploy**."

O agente **NÃO deve** executar `fly deploy` nem rodar os scripts k6 — essas etapas são de responsabilidade do usuário.

---

## Ordem de Execução Completa

```
1. Agente executa Fases 1-5 (este plano)
2. Agente roda Validação Final (build + testes)
3. ⛔ Agente PARA e sinaliza o usuário
4. Usuário faz deploy: fly deploy (no diretório backend/)
5. Usuário roda k6:  k6 run -e BASE_URL=https://olimpiedas-ibb-backend.fly.dev loadtest/k6-load-test.js
6. Usuário analisa resultados e ajusta se necessário
```

---

## Resumo de Prioridades

| Fase | Prioridade | Descrição | Esforço |
|---|---|---|---|
| **1** | 🔴 Crítico | Ajuste de rate limits | ~30min |
| **2** | 🔴 Crítico | Otimização fly.toml + Dockerfile | ~30min |
| **3** | 🟡 Alto | Health check + middleware de métricas | ~1h |
| **4** | 🟡 Alto | Índices de DB + cache de modalidades | ~1h |
| **5** | 🟢 Médio | Validação dos scripts k6 | ~15min |

**Tempo total estimado: ~3-4 horas.**
