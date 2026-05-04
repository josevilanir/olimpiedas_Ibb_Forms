import type { Modality } from "../types";

export function calcAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function isAgeOutOfRange(birthDate: string, modality: Modality | null): boolean {
  if (!modality) return false;
  const { minAge, maxAge } = modality;
  if (!minAge && !maxAge) return false;
  const age = calcAge(birthDate);
  if (minAge && age < minAge) return true;
  if (maxAge && age > maxAge) return true;
  return false;
}
