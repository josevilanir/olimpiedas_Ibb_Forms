/**
 * k6 Load Test — Olimpíadas IBB
 * Simula o fluxo completo de 500 usuários simultâneos:
 *   1. GET  /health              (Health check / Landing Page load)
 *   2. GET  /api/v1/modalities   (Listar Modalidades)
 *   3. POST /api/v1/participants (Enviar Inscrição)
 *
 * Instalação:
 *   - Windows: choco install k6  |  winget install grafana.k6
 *   - Linux:   sudo snap install k6
 *   - macOS:   brew install k6
 *
 * Execução:
 *   k6 run loadtest/k6-load-test.js
 *
 * Execução com output em JSON (para análise posterior):
 *   k6 run --out json=results.json loadtest/k6-load-test.js
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// ─── Custom Metrics ────────────────────────────────────────────────
const registrationErrors = new Rate("registration_errors");
const registrationDuration = new Trend("registration_duration", true);
const rateLimitHits = new Counter("rate_limit_429_hits");
const spotFullErrors = new Counter("spot_full_errors");

// ─── Configuration ─────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

// Sample modality IDs — update these with real IDs from your database.
// Run this SQL to get them:  SELECT id, name FROM modalities;
const MODALITY_IDS = (__ENV.MODALITY_IDS || "").split(",").filter(Boolean);

// Sample registration payloads (varied data to avoid duplicate detection)
function generatePayload(vuId, iteration, modalityIds) {
  const genders = ["MASCULINO", "FEMININO"];
  const memberStatuses = ["SIM", "NAO", "GR"];
  const gender = genders[vuId % 2];
  const isMember = memberStatuses[vuId % 3];

  // Generate a birth date between 1985-2010 to cover various age ranges
  const year = 1985 + (vuId % 25);
  const month = String((vuId % 12) + 1).padStart(2, "0");
  const day = String((vuId % 28) + 1).padStart(2, "0");

  // Pick 1-3 modalities randomly from the available ones
  const numModalities = Math.min(modalityIds.length, (vuId % 3) + 1);
  const selectedModalities = modalityIds.slice(0, numModalities);

  return {
    isForChild: year > 2008,
    isMember: isMember,
    birthDate: `${year}-${month}-${day}`,
    fullName: `Usuário Teste ${vuId}-${iteration}`,
    parentName: year > 2008 ? `Pai/Mãe do Usuário ${vuId}` : undefined,
    whatsapp: `8499${String(vuId).padStart(3, "0")}${String(iteration).padStart(4, "0")}`,
    gender: gender,
    healthIssues: vuId % 5 === 0 ? "Asma leve" : null,
    termsAccepted: true,
    modalityIds: selectedModalities,
  };
}

// ─── Test Scenarios ────────────────────────────────────────────────
export const options = {
  scenarios: {
    // Fase 1: Smoke Test — garantir que tudo funciona com carga mínima
    smoke: {
      executor: "constant-vus",
      vus: 5,
      duration: "30s",
      startTime: "0s",
      tags: { phase: "smoke" },
    },

    // Fase 2: Ramp-up gradual até 500 VUs (simula abertura das inscrições)
    peak_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 50 },   // Aquecimento
        { duration: "30s", target: 150 },  // Carga moderada
        { duration: "30s", target: 300 },  // Carga alta
        { duration: "1m", target: 500 },   // Pico máximo
        { duration: "2m", target: 500 },   // Sustenta o pico
        { duration: "30s", target: 100 },  // Desaceleração
        { duration: "30s", target: 0 },    // Finalização
      ],
      startTime: "35s",
      tags: { phase: "peak" },
    },

    // Fase 3: Spike Test — pico repentino (cenário de "todo mundo entra ao mesmo tempo")
    spike: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "5s", target: 500 },   // Pico instantâneo
        { duration: "1m", target: 500 },   // Sustenta
        { duration: "10s", target: 0 },    // Drop
      ],
      startTime: "6m30s",
      tags: { phase: "spike" },
    },
  },

  // ─── Thresholds (SLOs) ──────────────────────────────────────────
  thresholds: {
    // 95% das requisições devem completar em < 2s
    http_req_duration: ["p(95)<2000", "p(99)<5000"],

    // Taxa de erro global < 5%
    http_req_failed: ["rate<0.05"],

    // Taxa de erro de inscrição < 10% (inclui vagas cheias)
    registration_errors: ["rate<0.10"],

    // Tempo médio de inscrição < 1.5s
    registration_duration: ["avg<1500", "p(95)<3000"],

    // Menos de 50 hits de rate limit (indica que os limites estão ok)
    rate_limit_429_hits: ["count<50"],
  },
};

// ─── Default Function (executed by each VU) ────────────────────────
export default function () {
  let modalityIds = MODALITY_IDS;

  // ── Step 1: Health Check / Landing Page ──────────────────────────
  group("01 - Landing Page (Health Check)", function () {
    const res = http.get(`${BASE_URL}/health`, {
      tags: { endpoint: "health" },
    });

    check(res, {
      "health: status 200": (r) => r.status === 200,
      "health: response time < 500ms": (r) => r.timings.duration < 500,
      "health: body contains ok": (r) => {
        const body = r.json();
        return body && body.status === "ok";
      },
    });
  });

  // Simula tempo de leitura do usuário na landing page (1-3s)
  sleep(Math.random() * 2 + 1);

  // ── Step 2: Listar Modalidades ───────────────────────────────────
  group("02 - Listar Modalidades", function () {
    const res = http.get(`${BASE_URL}/api/v1/modalities`, {
      tags: { endpoint: "modalities" },
    });

    const isOk = check(res, {
      "modalities: status 200": (r) => r.status === 200,
      "modalities: response time < 1s": (r) => r.timings.duration < 1000,
      "modalities: has data array": (r) => {
        const body = r.json();
        return body && Array.isArray(body.data) && body.data.length > 0;
      },
    });

    if (res.status === 429) {
      rateLimitHits.add(1);
    }

    // Se conseguiu buscar modalidades reais, usa elas no registro
    if (isOk) {
      try {
        const body = res.json();
        if (body.data && body.data.length > 0) {
          modalityIds = body.data.map((m) => m.id);
        }
      } catch (e) {
        // fallback para IDs configurados
      }
    }
  });

  // Simula tempo de preenchimento do formulário (2-5s)
  sleep(Math.random() * 3 + 2);

  // ── Step 3: Enviar Inscrição ─────────────────────────────────────
  group("03 - Enviar Inscrição", function () {
    if (modalityIds.length === 0) {
      console.warn(
        `VU ${__VU}: Sem modalidades disponíveis. Pule a inscrição.`
      );
      registrationErrors.add(1);
      return;
    }

    const payload = generatePayload(__VU, __ITER, modalityIds);
    const params = {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "register" },
    };

    const startTime = Date.now();
    const res = http.post(
      `${BASE_URL}/api/v1/participants`,
      JSON.stringify(payload),
      params
    );
    registrationDuration.add(Date.now() - startTime);

    if (res.status === 429) {
      rateLimitHits.add(1);
      registrationErrors.add(1);
      return;
    }

    const success = check(res, {
      "register: status 201": (r) => r.status === 201,
      "register: has participant data": (r) => {
        try {
          const body = r.json();
          return body && body.data && body.data.id;
        } catch {
          return false;
        }
      },
      "register: response time < 2s": (r) => r.timings.duration < 2000,
    });

    if (!success) {
      registrationErrors.add(1);
      try {
        const body = res.json();
        if (body.error && body.error.includes("vagas")) {
          spotFullErrors.add(1);
        }
      } catch {
        // non-JSON response
      }
    } else {
      registrationErrors.add(0);
    }
  });

  // Pausa entre iterações (simula usuário saindo ou voltando)
  sleep(Math.random() * 2 + 1);
}

// ─── Teardown ──────────────────────────────────────────────────────
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    totalRequests: data.metrics.http_reqs?.values?.count || 0,
    failedRequests: data.metrics.http_req_failed?.values?.passes || 0,
    avgResponseTime:
      Math.round(data.metrics.http_req_duration?.values?.avg) || 0,
    p95ResponseTime:
      Math.round(data.metrics.http_req_duration?.values?.["p(95)"]) || 0,
    p99ResponseTime:
      Math.round(data.metrics.http_req_duration?.values?.["p(99)"]) || 0,
    rateLimitHits: data.metrics.rate_limit_429_hits?.values?.count || 0,
    registrationErrorRate:
      data.metrics.registration_errors?.values?.rate || 0,
    spotFullErrors: data.metrics.spot_full_errors?.values?.count || 0,
  };

  console.log("\n" + "═".repeat(60));
  console.log("  📊 RESUMO DO TESTE DE CARGA — Olimpíadas IBB");
  console.log("═".repeat(60));
  console.log(`  Total de Requisições:      ${summary.totalRequests}`);
  console.log(`  Requisições com Falha:     ${summary.failedRequests}`);
  console.log(`  Tempo Médio de Resposta:   ${summary.avgResponseTime}ms`);
  console.log(`  P95 Tempo de Resposta:     ${summary.p95ResponseTime}ms`);
  console.log(`  P99 Tempo de Resposta:     ${summary.p99ResponseTime}ms`);
  console.log(`  Hits de Rate Limit (429):  ${summary.rateLimitHits}`);
  console.log(
    `  Taxa de Erro Inscrição:    ${(summary.registrationErrorRate * 100).toFixed(1)}%`
  );
  console.log(`  Erros "Vagas Cheias":      ${summary.spotFullErrors}`);
  console.log("═".repeat(60) + "\n");

  return {
    "loadtest/results-summary.json": JSON.stringify(summary, null, 2),
    stdout: textSummary(data, { indent: "  ", enableColors: true }),
  };
}

import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.3/index.js";
