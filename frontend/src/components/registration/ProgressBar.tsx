import { motion } from "framer-motion";
import styles from "../../pages/RegistrationPage.module.css";

interface ProgressBarProps {
  step: number;
  total: number;
}

export function ProgressBar({ step, total }: ProgressBarProps) {
  const pct = Math.round((step / (total - 1)) * 100);
  return (
    <div className={styles.progressWrapper}>
      <div className={styles.progressTrack}>
        <motion.div 
          className={styles.progressFill} 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: "100%", transformOrigin: "left" }}
        />
        <motion.span 
          className={styles.progressRunner} 
          initial={{ left: 0 }}
          animate={{ left: `calc(${pct}% - 14px)` }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          🏃‍♂️
        </motion.span>
        <span className={styles.progressFlag}>🏁</span>
      </div>
      <p className={styles.progressLabel}>Etapa {step + 1} de {total}</p>
    </div>
  );
}
