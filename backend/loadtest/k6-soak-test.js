/**
 * k6 Soak Test — Olimpíadas IBB
 * Teste de resistência: carga moderada por tempo prolongado.
 * Útil para detectar memory leaks e connection pool exhaustion.
 *
 * Execução:
 *   k6 run loadtest/k6-soak-test.js
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Counter } from "k6/metrics";

const registrationErrors = new Rate("registration_errors");
const rateLimitHits = new Counter("rate_limit_429_hits");

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

export const options = {
  scenarios: {
    soak: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 100 },   // Ramp up
        { duration: "10m", target: 100 },  // Sustenta por 10 minutos
        { duration: "2m", target: 200 },   // Sobe para carga moderada
        { duration: "10m", target: 200 },  // Sustenta 200 VUs
        { duration: "2m", target: 0 },     // Cool down
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<3000"],
    http_req_failed: ["rate<0.05"],
    registration_errors: ["rate<0.10"],
  },
};

function generatePayload(vuId, iteration, modalityIds) {
  const genders = ["MASCULINO", "FEMININO"];
  const memberStatuses = ["SIM", "NAO", "GR"];
  const year = 1985 + (vuId % 25);
  const month = String((vuId % 12) + 1).padStart(2, "0");
  const day = String((vuId % 28) + 1).padStart(2, "0");
  const numModalities = Math.min(modalityIds.length, (vuId % 3) + 1);

  return {
    isForChild: year > 2008,
    isMember: memberStatuses[vuId % 3],
    birthDate: `${year}-${month}-${day}`,
    fullName: `Soak User ${vuId}-${iteration}`,
    parentName: year > 2008 ? `Parent ${vuId}` : undefined,
    whatsapp: `84999${String(vuId).padStart(2, "0")}${String(iteration).padStart(4, "0")}`,
    gender: genders[vuId % 2],
    healthIssues: null,
    termsAccepted: true,
    modalityIds: modalityIds.slice(0, numModalities),
  };
}

export default function () {
  // Step 1: Health Check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, { "health ok": (r) => r.status === 200 });

  sleep(1);

  // Step 2: Listar Modalidades
  const modRes = http.get(`${BASE_URL}/api/v1/modalities`);
  check(modRes, { "modalities ok": (r) => r.status === 200 });

  let modalityIds = [];
  if (modRes.status === 200) {
    try {
      modalityIds = modRes.json().data.map((m) => m.id);
    } catch (e) { /* fallback */ }
  }

  if (modRes.status === 429) rateLimitHits.add(1);

  sleep(2);

  // Step 3: Registrar
  if (modalityIds.length > 0) {
    const payload = generatePayload(__VU, __ITER, modalityIds);
    const res = http.post(
      `${BASE_URL}/api/v1/participants`,
      JSON.stringify(payload),
      { headers: { "Content-Type": "application/json" } }
    );

    if (res.status === 429) rateLimitHits.add(1);
    registrationErrors.add(res.status !== 201 ? 1 : 0);
  }

  sleep(Math.random() * 3 + 2);
}
