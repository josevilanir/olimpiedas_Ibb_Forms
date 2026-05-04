import { motion } from "framer-motion";
import type { Modality } from "../../types";
import styles from "../../pages/RegistrationPage.module.css";

const MODALITY_COLORS: [string, string][] = [
  ["natação",   "rgba(14,165,233,0.12)"],
  ["futsal",    "rgba(34,197,94,0.12)"],
  ["tênis",     "rgba(239,68,68,0.12)"],
  ["basquete",  "rgba(249,115,22,0.12)"],
  ["vôlei",    "rgba(139,92,246,0.12)"],
  ["corrida",   "rgba(236,72,153,0.12)"],
  ["caminhada", "rgba(20,184,166,0.12)"],
  ["e-sports",  "rgba(99,102,241,0.12)"],
  ["circuito",  "rgba(245,158,11,0.12)"],
  ["queimada",  "rgba(132,204,22,0.12)"],
  ["funcional", "rgba(16,185,129,0.12)"],
];

export function modalityColor(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, color] of MODALITY_COLORS) {
    if (lower.includes(key)) return color;
  }
  return "transparent";
}

interface ModalityCardProps {
  modality: Modality;
  selected: boolean;
  eligible: boolean;
  onToggle: () => void;
  onHover: (color: string) => void;
  ageRangeLabel: string;
}

export function ModalityCard({ modality, selected, eligible, onToggle, onHover, ageRangeLabel }: ModalityCardProps) {
  return (
    <motion.button
      className={`${styles.modalityCard} ${selected ? styles.modalitySelected : ""} ${!eligible ? styles.modalityLocked : ""}`}
      onClick={onToggle}
      disabled={!eligible}
      whileHover={eligible ? { scale: 1.03, boxShadow: "0 4px 20px rgba(102,126,234,0.3)" } : undefined}
      whileTap={eligible ? { scale: 0.97 } : undefined}
      onHoverStart={eligible ? () => onHover(modalityColor(modality.name)) : undefined}
      onHoverEnd={eligible ? () => onHover("transparent") : undefined}
    >
      <span className={styles.modalityName}>{modality.name}</span>
      <span className={styles.modalityCoord}>Coord: {modality.coordinatorName}</span>
      <span className={styles.modalityAge}>{ageRangeLabel}</span>
      {modality.requiresMembership && (
        <span className={styles.modalityMember}>Membros IBB/GR</span>
      )}
      {selected && <span className={styles.modalityCheck}>✓</span>}
    </motion.button>
  );
}
