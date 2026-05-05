import type { Modality } from "../types";

export type ModalityCategory = "corrida" | "coletivo" | "esports" | "individual" | "geral";

export const categoryLabels: Record<ModalityCategory, string> = {
  corrida: "Corrida",
  coletivo: "Coletivos",
  esports: "E-Sports",
  individual: "Individual",
  geral: "Geral",
};

export const categoryIcons: Record<ModalityCategory, string> = {
  corrida: "🏃",
  coletivo: "⚽",
  esports: "🎮",
  individual: "🌟",
  geral: "📦",
};

export function getModalityCategory(name: string): ModalityCategory {
  const n = name.toLowerCase();

  if (
    n.includes("corrida") || 
    n.includes("circuito adulto") ||
    n.includes("circuito kids") ||
    n.includes("caminhada") ||
    n.includes("kids")
  ) {
    return "corrida";
  }

  if (
    n.includes("futsal") ||
    n.includes("volei") ||
    n.includes("vôlei") ||
    n.includes("queimada") ||
    n.includes("basquete")
  ) {
    return "coletivo";
  }

  if (n.includes("e-sports") || n.includes("fifa") || n.includes("cs") || n.includes("lol")) {
    return "esports";
  }

  if (
    n.includes("natação") ||
    n.includes("tenis de mesa") ||
    n.includes("tênis de mesa") ||
    n.includes("treino funcional")
  ) {
    return "individual";
  }

  return "geral";
}

export function groupModalities(modalities: Modality[]) {
  const groups: Record<ModalityCategory, Modality[]> = {
    corrida: [],
    coletivo: [],
    esports: [],
    individual: [],
    geral: [],
  };

  modalities.forEach((m) => {
    const cat = getModalityCategory(m.name);
    groups[cat].push(m);
  });

  return groups;
}
