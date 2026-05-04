import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Modality } from "../../types";
import styles from "../../pages/RegistrationPage.module.css";

interface UnavailableModalityCardProps {
  modality: Modality;
  reasons: string[];
  ageRangeLabel: string;
}

export function UnavailableModalityCard({ modality, reasons, ageRangeLabel }: UnavailableModalityCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className={`${styles.modalityCard} ${styles.modalityLocked} ${expanded ? styles.expanded : ""}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onClick={() => setExpanded(!expanded)}
      layout
    >
      <span className={styles.modalityName}>{modality.name}</span>
      <span className={styles.modalityCoord}>Coord: {modality.coordinatorName}</span>
      <span className={styles.modalityAge}>{ageRangeLabel}</span>
      {modality.requiresMembership && (
        <span className={styles.modalityMember}>Membros IBB/GR</span>
      )}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={styles.unavailableReasons}
          >
            <div className={styles.reasonsTitle}>Motivo(s) da indisponibilidade:</div>
            <ul className={styles.reasonsList}>
              {reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
