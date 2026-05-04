import type { Modality } from "../types";

export type ModalityCategory = "corrida" | "coletivo" | "esports" | "kids" | "livre" | "geral";

export const categoryLabels: Record<ModalityCategory, string> = {
  corrida: "Corrida",
  coletivo: "Coletivos",
  esports: "E-Sports",
  kids: "Kids",
  livre: "Livre",
  geral: "Geral",
};

export const categoryIcons: Record<ModalityCategory, string> = {
  corrida: "🏃",
  coletivo: "⚽",
  esports: "🎮",
  kids: "🧒",
  livre: "🌟",
  geral: "📦",
};

export function getModalityCategory(name: string): ModalityCategory {
  const n = name.toLowerCase();

  if (n.includes("corrida") || n.includes("circuito adulto")) {
    if (n.includes("kids") || n.includes("pré teens")) {
      if (n.includes("kids")) return "kids";
      // Pré-teens are grouped with Corrida in landing page for short runs, but some are kids.
      // Looking at landing page: "Corrida Curta Pré-Teens" is under "corrida".
      return "corrida";
    }
    return "corrida";
  }

  if (n.includes("circuito kids")) return "kids";
  if (n.includes("kids")) return "kids";

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
    n.includes("caminhada") ||
    n.includes("natação") ||
    n.includes("tenis de mesa") ||
    n.includes("tênis de mesa") ||
    n.includes("treino funcional")
  ) {
    return "livre";
  }

  return "geral";
}

export function groupModalities(modalities: Modality[]) {
  const groups: Record<ModalityCategory, Modality[]> = {
    corrida: [],
    coletivo: [],
    esports: [],
    kids: [],
    livre: [],
    geral: [],
  };

  modalities.forEach((m) => {
    const cat = getModalityCategory(m.name);
    groups[cat].push(m);
  });

  return groups;
}
