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
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        <span className={styles.progressRunner} style={{ left: `calc(${pct}% - 14px)` }}>
          🏃‍♂️
        </span>
        <span className={styles.progressFlag}>🏁</span>
      </div>
      <p className={styles.progressLabel}>Etapa {step + 1} de {total}</p>
    </div>
  );
}
