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
