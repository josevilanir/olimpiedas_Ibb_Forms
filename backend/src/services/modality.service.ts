import { findAllModalities } from "../repositories/modality.repository";

let cachedModalities: unknown[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getAllModalities() {
  const now = Date.now();
  if (cachedModalities && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedModalities;
  }

  const modalities = await findAllModalities();
  cachedModalities = modalities;
  cacheTimestamp = now;
  return modalities;
}

export function invalidateModalityCache() {
  cachedModalities = null;
  cacheTimestamp = 0;
}
