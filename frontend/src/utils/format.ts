export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function ageLabel(minAge: number | null, maxAge: number | null): string {
  if (!minAge && !maxAge) return "Livre";
  if (minAge && maxAge) return `${minAge}–${maxAge} anos`;
  if (minAge) return `${minAge}+ anos`;
  return `até ${maxAge} anos`;
}
