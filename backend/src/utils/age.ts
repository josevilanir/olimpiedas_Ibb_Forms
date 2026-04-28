export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function isEligibleForModality(
  age: number,
  isMember: boolean,
  modalityMinAge: number | null,
  modalityMaxAge: number | null,
  requiresMembership: boolean
): boolean {
  if (requiresMembership && !isMember) return false;
  if (modalityMinAge !== null && age < modalityMinAge) return false;
  if (modalityMaxAge !== null && age > modalityMaxAge) return false;
  return true;
}
