export function calculateAge(birthDateStr: string): number | null {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function isEligible(
  age: number,
  isMember: boolean,
  minAge: number | null,
  maxAge: number | null,
  requiresMembership: boolean
): boolean {
  if (requiresMembership && !isMember) return false;
  if (minAge !== null && age < minAge) return false;
  if (maxAge !== null && age > maxAge) return false;
  return true;
}
